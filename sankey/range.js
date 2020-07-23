function formatValue() {
    return `${this.name}: ${parseFloat(this.value)}`
}

function getVals(e) {
    // Get slider values
    e.preventDefault()

    const parent = this.parentNode;
    const slides = Array.from(parent.getElementsByTagName("input"));
    if (e.target === slides[slides.length - 1]) {
        e.target.value = e.target.max;
        return;
    }

    const values = [];
    const formatedValues = [];
    for (i = 0; i < slides.length - 1; i++) {
        const s = slides[i];
        const v = parseFloat(s.value);
        const [b, a] = [
            i ? parseFloat(slides[i - 1].value) : 0, 
            parseFloat(slides[i + 1].value)
        ]
        if (e.target === s) {
            if (b && (v <= b)) return s.value = b + parseFloat(s.step);
            if (v >= a) return s.value = a - parseFloat(s.step);
        }
        formatedValues.push(s.formatValue(b));
        values.push(v - b)
    }
    const last = slides.pop();
    const lastValue = parseFloat(slides.pop().value)
    formatedValues.push(last.formatValue(lastValue));
    values.push(e.target.max - lastValue)

    if (e.target.updateVals) e.target.updateVals(formatedValues);
    if (e.target.update) e.target.update(values);
    
    parent.data = values;
}

const defaultConfig = {min: 0, max: 100, type: 'range', step: 5, formatValue}
function makeSlider(
    sliders = [{value: 10}, {value: 50}, {value: 70}], config = {}) {
    config = Object.assign({}, defaultConfig, config);
    const d = document.createElement('section')
    d.setAttribute('class', 'range-slider')
    
    const span = document.createElement('span')
    span.setAttribute('class', 'rangeValues')
    d.appendChild(span)

    const div = document.createElement('div')
    div.setAttribute('class', 'rangeSliders')
    d.appendChild(div)

    config.updateVals = values => {
        span.innerHTML = values.join(' - ')
    } 
    
    sliders = sliders.sort((a, b) => a.value - b.value)
    if (sliders[sliders.length - 1].value !== config.max) {
        sliders.push({value: config.max})
    }

    const s = sliders.map(function(s, i) {
        const e = document.createElement('input');
        
        Object.assign(e, config, {name: i}, s);
        e.oninput = getVals;

        div.appendChild(e)
        return e
    })

    s[0].oninput({target:s[0], preventDefault: () => {}})
    return d;
}

window.onload = function(){
    // Initialize Sliders
    var sliderSections = document.getElementsByClassName("range-slider");
    for( var x = 0; x < sliderSections.length; x++ ){
        var sliders = sliderSections[x].getElementsByTagName("input");
        for( var y = 0; y < sliders.length; y++ ){
            if( sliders[y].type ==="range" ){
                Object.assign(sliders[y], {oninput: getVals, formatValue})
                sliders[y].name = sliders[y].name || y;
                // Manually trigger event first time to display values
                sliders[y].oninput({target: sliders[y], preventDefault: () => {}});
            }
        }
    }
}

