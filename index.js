function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const links = [
    {source: "Anses", target: "Beneficiario", value: 10000},

    {source: "Beneficiario", target: "Servicios Publicos", value: 3000},
    {source: "Beneficiario", target: "Comercios Afiliado", value: 3000},
    {source: "Beneficiario", target: "Comercios no Afiliado", value: 2000},
    {source: "Beneficiario", target: "Banco", value: 2000},
    /*
       {source: "Beneficiario 2", target: "Servicios", value: 3000},
       {source: "Beneficiario 2", target: "Comercios Afiliado", value: 3000},
       {source: "Beneficiario 2", target: "Comercios no Afiliado", value: 2000},
       {source: "Beneficiarios 2", target: "Banco", value: 2000},
     */
       {source: "Comercios Afiliado", target: "Proveedores Minoritarios", value: 2000},
       {source: "Comercios Afiliado", target: "Banco", value: 1000},
       
       {source: "Comercios no Afiliado", target: "Proveedores Minoritarios", value: 1000},
       {source: "Comercios no Afiliado", target: "Banco", value: 1000},
       
       {source: "Proveedores Minoritarios", target: "Proveedores Mayoritarios", value: 2000},
       {source: "Proveedores Minoritarios", target: "Servicios Publicos", value: 1000},
       
       {source: "Proveedores Mayoritarios", target: "Servicios Publicos", value: 1000},
       {source: "Proveedores Mayoritarios", target: "Banco", value: 2000},
       
       {source: "Banco", target: "Proveedores Mayoritarios", value: 1000},
       {source: "Banco", target: "Anses", value: 5000},

       {source: "Servicios Publicos", target: "Anses", value: 5000},
]

const buildData = (links) => {
    const nodes = Array.from(
        new Set(
            links.flatMap(l => [l.source, l.target])),
        name => ({name, category: name.replace(/ .*/, ""), id: uuidv4()}));

    return {nodes, links, units: "IFD"};
}

function getDimensions(container, margin) {
    const bbox = container.node().getBoundingClientRect();
    return { width: 1000, height: 600 }
    return {
        width: bbox.width - margin.left - margin.right,
        height: bbox.height - margin.top - margin.bottom
    };
}

function updateSankey (containers, data, newSankey) {
    function updateLinks() {
        // Join new data with old elements
        const links = containers.links.selectAll('.link')
                                .data(data.links, d => `${d.source.id}${d.target.id}`);

        // Remove elements not present in new data
        links.exit().remove();

        // Update old elements
        links.attr('d', link => link.path)
             .style("stroke", function(d){ return d.source.color; })
             .style('stroke-width', d => Math.max(1, d.width))
             .attr('debug', d => console.error('debug', d.source.name, d.target.name))

        // Enter new elements
        const enteringLinks = links
            .enter()
            .append('path')
            .attr('class', 'link')
            .attr('d', link => link.path)
            .style("stroke", function(d){ return d.source.color; })
            .style('stroke-width', d => Math.max(1, d.width))
            .sort((a, b) => b.dy - a.dy);

        // Add the link titles
        enteringLinks.append('title')
                     .text(d => `${d.source.name} → ${d.target.name}\n${format(d.value)}`);        
    }

    function updateNodes() {
        // Join new data with old elements
        const nodes = containers.nodes.selectAll('.node')
                                .data(data.nodes, d => d.id);

        // Remove elements not present in new data
        nodes.exit().remove();

        // Update old elements
        nodes.attr('transform', d => `translate(${d.x0}, ${d.y0})`);

        // Enter new elements
        const enteringNodes = nodes.enter().append('g')
                                   .attr('class', 'node')
                                   .attr('transform', d => `translate(${d.x0}, ${d.y0})`);

        // Add the rectangles for the nodes
        enteringNodes
            .append('rect')
            .attr('height', d => d.y1 - d.y0)
            .attr('width',  30)
            .style('fill', d => {
                return (d.color = color(d.name.replace(/ .*/, '')));
            })
            .style('stroke', d => d3.rgb(d.color).darker(2))
            .on("mouseover", function (d) {
                let thisName = d.name;
                console.error(d, this)
                
                nodes.selectAll("rect")
                       .style("opacity", function (d) {
                           return highlightNodes(d, thisName)
                       })
                
                d3.selectAll(".sankey-link")
                       .style("opacity", function (l) {
                           return l.source.name == thisName || l.target.name == thisName ? 1 : 0.3;
                       })
                
                nodes.selectAll("text")
                       .style("opacity", function (d) {
                           return highlightNodes(d, thisName)
                       })
            })
            .on("mouseout", function (d) {
                d3.selectAll("rect").style("opacity", 0.5);
                d3.selectAll(".sankey-link").style("opacity", 0.7);
                d3.selectAll("text").style("opacity", 1);
            })
            .on("click", function (d) {
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
                        d.sourceLinks.forEach(({index}, i) => {
                            data.links[index].value = values[i];
                        })

                        const update = newSankey
                            .nodes(data.nodes)
                            .links(data.links)();

                        updateSankey(containers, update, newSankey);
                        console.error('update', data)
                    }
                }], []), {
                    max: d.value,
                    formatValue: function(b) {
                        return `${this.name}: ${parseFloat(this.value - b)} (${format(100*(parseFloat(this.value) - b)/d.value)}%)`
                    }
                });
                g.appendChild(s);
                g.configTooltip = s;
            })
            .append('title')
            .text(d => `${d.name}\n${format(d.value)}`)
        
        // Add node names
        enteringNodes
            .append('text')
            .attr('text-anchor', 'start')
            .text(d => d.name)
            .style("fill", function(d) {
                return d3.rgb(d.color).darker(1.4);
            })
            .style("font-size", function(d) {
                return Math.floor(fontScale(d.value)) + "px";
            })
            .filter(d => d.x < width / 2)
            .attr('x', 6 + sankey.nodeWidth())
            .attr('text-anchor', 'start');
    }
    
    updateLinks();
    updateNodes();
}

let data = buildData(links);

const container = d3.select('#chart');
const margin = { top: 30, right: 30, bottom: 30, left: 30};
const {width, height} = getDimensions(container, margin);

var sankey = d3.sankeyCircular()
               .nodeWidth(10)
               .nodePaddingRatio(0.7)
               .size([width, height])
    	       .nodeId(function (d) {
                   return d.name;
               })
               .nodeAlign(d3.sankeyJustify)
               .iterations(16)
               .circularLinkGap(2);

const formatNumber = d3.format(',.0f');
const format = d => formatNumber(d);
const color = d3.scaleOrdinal(d3.schemeCategory10);

// append the svg object to the body of the page
const svg = container
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

const sankeyContainer = svg.append('g')
                           .attr('transform', `translate(${margin.left}, ${margin.top})`);

//run the Sankey + circular over the data
const sankeyData = sankey(data)

const fontScale = d3.scaleLinear() .range([10, 25]);
fontScale.domain(d3.extent(sankeyData.nodes, function(d) { return d.value }));

const containers = {
    links: sankeyContainer.append('g'),
    nodes: sankeyContainer.append('g')
}

updateSankey(containers, sankeyData, sankey)

function resize() {
    const updatedDimensions = getDimensions(container, margin);
    // Resize SVG
    svg
        .attr('width', updatedDimensions.width + margin.left + margin.right)
        .attr('height', updatedDimensions.height + margin.top + margin.bottom);

    const {nodes, links} = data;
    const newSankey = d3.sankeyCircular()
        .nodeWidth(36)
        .nodePadding(40)
        .size([updatedDimensions.width, updatedDimensions.height]);

    const update = newSankey
        .nodes(nodes)
        .links(links)();

    updateSankey(containers, update, newSankey);
}

d3.select(window).on('resize', resize);
