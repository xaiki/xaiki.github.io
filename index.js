function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const buildData = () => {
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
  const nodes = Array.from(
    new Set(
      links.flatMap(l => [l.source, l.target])),
    name => ({name, category: name.replace(/ .*/, ""), id: uuidv4()}));
  
  return {nodes, links, units: "IFD"};
}

let data = buildData();

var margin = { top: 30, right: 30, bottom: 30, left: 30};
var width = 1000;
var height = 600;

var sankey = d3.sankeyCircular()
               .nodeWidth(10)
               .nodePaddingRatio(0.7)
               .size([width, height])
    	         .nodeId(function (d) {
                 return d.name;
               })
               .nodeAlign(d3.sankeyJustify)
               .iterations(32)
               .circularLinkGap(2);

var svg = d3.select("#chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);

var g = svg.append("g")
           .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var linkG = g.append("g")
             .attr("class", "links")
             .attr("fill", "none")
             .attr("stroke-opacity", 0.2)
             .selectAll("path");

var nodeG = g.append("g")
             .attr("class", "nodes")
             .attr("font-family", "sans-serif")
             .attr("font-size", 10)
             .selectAll("g");

//run the Sankey + circular over the data
const {nodes, links} = sankey(data)

let depthExtent = d3.extent(nodes, function (d) { return d.depth; });

var nodeColour = d3.scaleSequential(d3.interpolateCool)
                   .domain([0,width]);

var node = nodeG.data(nodes)
                .enter()
                .append("g")
                .attr("id", function(d) { return d.id });

node.append("rect")
    .attr("x", function (d) { return d.x0; })
    .attr("y", function (d) { return d.y0; })
    .attr("height", function (d) { return d.y1 - d.y0; })
    .attr("width", function (d) { return d.x1 - d.x0; })
    .style("fill", function (d) { return nodeColour(d.x0); })
    .style("opacity", 0.5)
    .on("mouseover", function (d) {

      let thisName = d.name;
      console.error(d, this)

      node.selectAll("rect")
          .style("opacity", function (d) {
            return highlightNodes(d, thisName)
          })

      d3.selectAll(".sankey-link")
          .style("opacity", function (l) {
            return l.source.name == thisName || l.target.name == thisName ? 1 : 0.3;
          })

      node.selectAll("text")
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
      }

      const s = makeSlider(d.sourceLinks.reduce((a, c, i) => [...a, {
        name: c.target.name,
        value: c.value + (i ? a[i - 1].value : 0),
        update: (values) => {
          d.sourceLinks.forEach(({index}, i) => links[index].value = values[i] )
          
        }
      }], []), {
        max: d.value,
        formatValue: function(b) {
          return `${this.name}: ${100*(parseFloat(this.value) - b)/d.value}%`
        }
      });
      g.appendChild(s);
      g.configTooltip = s;
    })

node.append("text")
    .attr("x", function (d) { return (d.x0 + d.x1) / 2; })
    .attr("y", function (d) { return d.y0 - 12; })
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .text(function (d) { return d.name; });

node.append("title")
    .text(function (d) { return d.name + "\n" + (d.value); });

var link = linkG.data(links)
                .enter()
                .append("g")

link.append("path") 
                .attr("class", "sankey-link")
                .attr("d", function(link){
                  return link.path;
                })
                .style("stroke-width", function (d) { return Math.max(1, d.width); })
                .style("opacity", 0.7)
                .style("stroke", function (link, i) {
                  return link.circular ? "red" : "black"
                })

link.append("title")
                .text(function (d) {
                  return d.source.name + " → " + d.target.name + "\n Index: " + (d.index);
                });

let arrows = pathArrows()
  .arrowLength(10)
  .gapLength(150)
  .arrowHeadSize(4)
  .path(function(link){ return link.path })

var arrowsG = linkG.data(links)
                   .enter()
                   .append("g")
                   .attr("class", "g-arrow")
                   .call(arrows)

function highlightNodes(node, name) {

  let opacity = 0.3

  if (node.name == name) {
    opacity = 1;
  }
  node.sourceLinks.forEach(function (link) {
    if (link.target.name == name) {
      opacity = 1;
    };
  })
  node.targetLinks.forEach(function (link) {
    if (link.source.name == name) {
      opacity = 1;
        };
      })

      return opacity;

    }
