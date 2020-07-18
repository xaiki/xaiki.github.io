function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const dataLinks = [
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
//    {source: "Proveedores Mayoritarios", target: "Banco", value: 2000},
    
    {source: "Banco", target: "Proveedores Mayoritarios", value: 1000},
//    {source: "Banco", target: "Anses", value: 5000},

//    {source: "Servicios Publicos", target: "Anses", value: 5000},
]

function buildData(links) {
    const nodes = Array.from(
        new Set(
            links.flatMap(l => [l.source, l.target])),
        name => ({name, category: name.replace(/ .*/, ""), id: uuidv4()}));

    return {nodes, links, units: "IFD"};
}

window.links = dataLinks
