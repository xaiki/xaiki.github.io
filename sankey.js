const {width, height} = document.querySelector('body').getClientRects()[0];

console.error(width, height)

const color = d3.scaleOrdinal(d3.schemeCategory10);
const format = d3.format(',.0f');

const sankey = d3.sankey()
                 .nodeId(d => d.name)
                 .nodeAlign(d3.sankeyJustify)
                 .nodeWidth(15)
                 .nodePadding(10)
                 .extent([[1, 5], [width - 1, height - 5]]);

const makeSankey = ({nodes, links}) => sankey({
    nodes: nodes.map(d => Object.assign({}, d)),
    links: links.map(d => Object.assign({}, d))
});

const data = buildData(window.links)
const {nodes, links} = makeSankey(data);

const fontScale = d3.scaleLinear() .range([10, 25]);
fontScale.domain(d3.extent(nodes, function(d) { return d.value }));

const container = d3.select('#chart');
const svg = container.append('svg')
                     .attr('viewBox', [0, 0, width, height]);

const nodeG = svg.append("g")
                 .attr("stroke", "#000");

const linkG = svg.append("g")
                 .attr("fill", "none")
                 .attr("stroke-opacity", 0.5);

const nodeTextG = svg.append("g")
                     .attr("font-family", "sans-serif")
                     .attr("font-size", 10)

function onClick(d, data) {
    const g = document.getElementById("sliders")

    if (g.configTooltip) {
        g.configTooltip.remove();
        g.configTooltip = null;
        return;
    }

    const s = makeSlider(d.sourceLinks.reduce((a, c, i) => [...a, {
        name: c.target.name,
        value: c.value + (i ? a[i - 1].value : 0),
        update: (values) => {
            let changed = 0
            d.sourceLinks.forEach(({index}, i) => {
                if (window.links[index].value !== values[i]) {
                    changed++
                    window.links[index].value = values[i];
                }
            })
            if (changed) {
                const updateData = makeSankey(buildData(window.links))
                update(updateData)
                console.error('update', updateData)
            }
        }
    }], []), {
        max: d.value,
        formatValue: function(b) {
            return `${this.name}: ${parseFloat(this.value - b)} (${format(100*(parseFloat(this.value) - b)/d.value)}%)`
        }
    });
    g.appendChild(s);
    g.configTooltip = s;
}

function clearOpacity() {
    d3.selectAll("rect").style("opacity", 0.5);
    d3.selectAll(".sankey-link").style("opacity", 0.7);
    d3.selectAll("text").style("opacity", 1);
}

function update(data) {
    function updateNodes(nodes) {
        const allNodes = nodeG
            .selectAll("rect");
        
        allNodes
            .data(nodes)
            .join(
                enter => enter.append("rect"),
                update => update,
                exit => exit.remove()
            )
            .attr("x", d => d.x0)
            .attr("y", d => d.y0)
            .attr("height", d => d.y1 - d.y0)
            .attr("width", d => d.x1 - d.x0)
            .attr("fill", d => color(d.name))
            .on("click", d => onClick(d, data))
            .on("mouseover", d => {
                let name = d.name
                allNodes.style("opacity", d => highlightNodes(d, name))
                d3.selectAll(".sankey-link")
                            .style("opacity",
                                   l => l.source.name === name || l.target.name === name ? 1 : 0.3)
            })
            .on("mouseout", clearOpacity)
        

        allNodes.enter()
            .append("title")
            .text(d=> `${d.name}\n${format(d.value)}`)
            .style("fill", d => d3.rgb(color(d.name)).darker(1.4))
        
    }
    function updateLinks(links) {
        const link = linkG
            .selectAll("g")
            .data(links, links => `${links.source.name}${links.target.name}`)
        
        link.exit().remove()

        link
            .attr('debug', console.error.bind(console))
        
        link.select('path')
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => color(d.source.name))
            .attr("stroke-width", d => Math.max(1, d.width));

        link.select('title')
              .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

        const enter = link.enter()
                          .append('g')
                          .attr("class", "sankey-link");
        enter
            .append("path")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke", d => color(d.source.name))
            .attr("stroke-width", d => Math.max(1, d.width));
        
        enter.append("title")
             .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

    }
    function updateNodeTexts(nodes) {
        const node = nodeTextG
            .selectAll("text")
            .data(nodes)
            .join("text")
            .attr("x", d => (d.x0 < width / 2) ? d.x1 + 6 : d.x0 - 6)
            .attr("y", d => (d.y1 + d.y0) / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
            .text(d => d.name)
            .style("fill", d => d3.rgb(color(d.name)).darker(1.4))
            .style("font-size", d => Math.floor(fontScale(d.value)) + "px")
    }
    
    updateNodes(data.nodes)
    updateLinks(data.links)
    updateNodeTexts(data.nodes)
}

update({nodes, links})
