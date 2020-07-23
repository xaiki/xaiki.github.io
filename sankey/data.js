function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const dataLinks = [
    {source: "Anses", target: "Beneficiario IFE", value: 10000},

    {source: "Beneficiario IFE", target: "Servicios Publicos", value: 3000},
    {source: "Beneficiario IFE", target: "Comercios Afiliado", value: 3000},
    {source: "Beneficiario IFE", target: "Comercios no Afiliado", value: 2000},
    {source: "Beneficiario IFE", target: "Banco", value: 2000},

    {source: "Ministerio de Desarrollo Social", target: "Beneficiario IUM", value: 10000},

    {source: "Beneficiario IUM", target: "Servicios Publicos", value: 3000},
    {source: "Beneficiario IUM", target: "Comercios Afiliado", value: 3000},
    {source: "Beneficiario IUM", target: "Comercios no Afiliado", value: 2000},
    {source: "Beneficiario IUM", target: "Banco", value: 2000},

    {source: "Comercios Afiliado", target: "Proveedores Minoritarios", value: 2000},
    {source: "Comercios Afiliado", target: "Banco", value: 1000},
    {source: "Comercios Afiliado", target: "Servicios Publicos", value: 1000},
    {source: "Comercios Afiliado", target: "AFIP", value: 1000},
    
    {source: "Comercios no Afiliado", target: "Proveedores Minoritarios", value: 1000},
    {source: "Comercios no Afiliado", target: "Banco", value: 1000},
    {source: "Comercios no Afiliado", target: "Servicios Publicos", value: 1000},
    {source: "Comercios no Afiliado", target: "AFIP", value: 1000},

    
    {source: "Proveedores Minoritarios", target: "Proveedores Mayoritarios", value: 2000},
    {source: "Proveedores Minoritarios", target: "Servicios Publicos", value: 1000},

    {source: "Ministerio de Industria", target: "Proveedores Mayoritarios", value: 2000},
    {source: "INAES", target: "Proveedores Mayoritarios", value: 2000},
    
    {source: "Proveedores Mayoritarios", target: "Servicios Publicos", value: 5000},
    {source: "Proveedores Mayoritarios", target: "Banco", value: 2000},

    {source: "Servicios Publicos", target: "Anses", value: 5000},
    {source: "Servicios Publicos", target: "Ministerio de Desarrollo Social", value: 7000},
    
    {source: "Banco", target: "Proveedores Mayoritarios", value: 1000},
    {source: "Banco", target: "Proveedores Minoritarios", value: 1000},
    {source: "Banco", target: "Anses", value: 2000},
    {source: "Banco", target: "AFIP", value: 1000},
    {source: "Banco", target: "Ministerio de Desarrollo Social", value: 3000},

    {source: "AFIP", target: "Anses", value: 2000},
    {source: "AFIP", target: "Ministerio de Desarrollo Social", value: 1000},
    
    {source: "Proveedores Mayoritarios", target: "Anses", value: 5},
    {source: "Proveedores Mayoritarios", target: "Ministerio de Desarrollo Social", value: 5},
]


window.links = dataLinks
/*
console.error(Object.keys(dataLinks[0]).join("\t"))
dataLinks.map(l => console.error(Object.values(l).join("\t")))
*/
