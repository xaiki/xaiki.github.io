const LINK_BASE_OPACITY = 0.9;
const LINK_BG_OPACITY = 0.5;
const LINK_FG_OPACITY = 1;

const NODE_BASE_OPACITY = 0.8;
const NODE_BG_OPACITY = 0.5;
const NODE_FG_OPACITY = 1;

const uri = `https://docs.google.com/spreadsheets/d/e/${location.hash.slice(1)}/pub?output=csv`
console.error(uri)
d3.csv(uri)
  .then(buildSankey)

function buildSankey(linkData) {
    let {width, height} = document.querySelector('#chart').getClientRects()[0];
    width *= 2;

    console.error(width, height)

    const color = d3.scaleOrdinal([
        ...d3.schemeCategory10,
        "#660000", "#660066", "#666600", "#006666", "#000066",
        "#66ffff", "#66ff66", "#6666ff", "#ff6666", "#ffff66"]);
    const format = d3.format(',.0f');

    function makeSankey({nodes, links}) {
        const sankey = d3.sankeyCircular()
                         .nodeId(d => d.name)
                         .nodeAlign(d3.sankeyJustify)
                         .nodeWidth(20)
                         .nodePadding(30)
                         .extent([[1, 5], [width - 1, height - 5]]);
        
        return sankey({
            nodes: nodes.map(d => Object.assign({}, d)),
            links: links.map(d => Object.assign({}, d))
        })
    };

    function buildData(links) {
        console.error(links)
        const nodes = Array.from(
            new Set(
                links.flatMap(l => [l.source, l.target])),
            name => ({name, category: name.replace(/ .*/, ""), id: uuidv4()}));

        return {nodes, links, units: "IFD"};
    }

    const data = buildData(linkData)
    const {nodes, links} = makeSankey(data);

    const fontScale = d3.scaleLinear() .range([20, 40]);
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
        console.error('click', d, data)
        const g = document.getElementById("sliders")

        if (g.configTooltip) {
            g.configTooltip.remove();
            g.configTooltip = null;
            return;
        }

        const linkSet = d.sourceLinks
        const s = makeSlider(linkSet.reduce((a, c, i) => [...a, {
            name: c.target.name,
            value: c.value + (i ? a[i - 1].value : 0),
            update: (values) => {
                let changed = 0
                linkSet.forEach(({index}, i) => {
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
        d3.selectAll("rect").style("opacity", NODE_BASE_OPACITY);
        d3.selectAll(".sankey-link").style("opacity", LINK_BASE_OPACITY);
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

                    const hl = data.links
                                   .filter(l => l.source.name === name || l.target.name === name)

                    console.error(hl);
                    d3.selectAll(".sankey-link")
                                   .style("opacity",
                                          l => l.name in hl ? LINK_FG_OPACITY : LINK_BG_OPACITY)
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
                .attr("d", l => d3.sankeyLinkHorizontal ? d3.sankeyLinkHorizontal()(l) : l.path)
                .attr("stroke", d => color(d.source.name))
                .attr("stroke-width", d => Math.max(1, d.width))
                .style("opacity", LINK_BASE_OPACITY)

            link.select('title')
                .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

            const enter = link.enter()
                              .append('g')
                              .attr("class", "sankey-link");
            enter
                .append("path")
                .attr("d", l => d3.sankeyLinkHorizontal ? d3.sankeyLinkHorizontal()(l) : l.path)
                .attr("stroke", d => color(d.source.name))
                .attr("stroke-width", d => Math.max(1, d.width))
                .style("opacity", LINK_BASE_OPACITY);
            
            enter.append("title")
                 .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);

        }
        function updateNodeTexts(nodes) {
            function wrap(text, width = 30) {
                text.each(function() {
                    var text = d3.select(this),
                        words = text.text().split(/\s+/).reverse(),
                        word,
                        line = [],
                        lineNumber = 0,
                        lineHeight = 1.1, // ems
                        y = text.attr("y"),
                        dy = parseFloat(text.attr("dy")),
                        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                    while (word = words.pop()) {
                        line.push(word);
                        tspan.text(line.join(" "));
                        if (tspan.node().getComputedTextLength() > width) {
                            line.pop();
                            tspan.text(line.join(" "));
                            line = [word];
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                        }
                    }
                });
            }
            
            const node = nodeTextG
                .selectAll("text")
                .data(nodes)
                .join("text")
                .attr("transform", d => `translate(${d.x0 + 30} 0)`)
                .attr("y", d => d.y0)
                .attr("dy", "0.05em")
                .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
                .style("fill", d => d3.rgb(color(d.name)).darker(1.4))
                .style("font-size", d => Math.floor(fontScale(d.value)) + "px")
                .text(d => d.name)
                .call(wrap);
        }
        

        updateLinks(data.links)
        updateNodes(data.nodes)
        updateNodeTexts(data.nodes)
    }

    update({nodes, links})
}

