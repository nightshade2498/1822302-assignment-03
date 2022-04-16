const searchBox = document.getElementById('search')
const searchBtn = document.getElementById('go')
const autocomplete = document.getElementById('autocomplete')
const covidContainer = document.getElementById('covid')
const countryContainer = document.getElementById('country')
const covidLoading = document.getElementById('covid-loading')
const countryLoading = document.getElementById('country-loading')

const headers = {
    headers: { 'Accept': 'application/json' },
}
let countries = []
let selected = ''
let currentFocus = -1
const tableHeaders = ['Date', 'Confirmed', 'Deaths', 'Active']

const clearNodes = (parent) => {
    while (parent.firstChild) {
        parent.firstChild.remove()
    }
}

const createNode = (a) => {
    const element = document.createElement(a['tag'])
    element.classList.add(...a['class'])
    if (a['attributes']) {
        for (const [k, v] of Object.entries(a['attributes'])) {
            element.setAttribute(k, v)
        }
    }
    element.innerText = a['innerText']
    return element
}

const createRowNode = (a) => {
    const tr = document.createElement('tr')
    const th = document.createElement('th')
    th.setAttribute('scope', 'row')
    th.innerText = a['th']
    tr.appendChild(th)
    const tdEmpty = document.createElement('td')
    tdEmpty.innerText = ' '
    tr.appendChild(tdEmpty)
    const td = document.createElement('td')
    td.innerText = a['innerText']
    tr.appendChild(td)
    return tr
}

const createCountryNodes = (country) => {
    const flags = {
        tag: 'img',
        class: ['card-img-top', 'border', 'border-4', 'border-bottom-0'],
        innerText: '',
        attributes: {
            src: country['flags']['svg']
        }
    }
    countryContainer.appendChild(createNode(flags))

    const cardBody = document.createElement('div')
    cardBody.classList.add('card-body')

    const official = {
        tag: 'h5',
        class: ['card-title'],
        innerText: country['name']['official'],
    }
    cardBody.appendChild(createNode(official))

    const subregion = {
        tag: 'h6',
        class: ['card-subtitle', 'mb-3', 'text-muted'],
        innerText: `Country in the ${country['subregion']}`,
    }
    cardBody.appendChild(createNode(subregion))

    const table = document.createElement('table')
    table.classList.add('table', 'table-striped', 'table-hover', 'table-borderless', 'table-sm')
    const tbody = document.createElement('tbody')

    const continents = {
        th: 'Continent',
        innerText: country['continents'].join(', '),
    }
    tbody.appendChild(createRowNode(continents))

    const capital = {
        th: 'Capital',
        innerText: country['capital'].join(', '),
    }
    tbody.appendChild(createRowNode(capital))

    const area = {
        th: 'Area',
        innerText: `${country['area'].toLocaleString('en-IN')} sq. km`,
    }
    tbody.appendChild(createRowNode(area))

    const timezones = {
        th: 'Timezones',
        innerText: country['timezones'].join(', '),
    }
    tbody.appendChild(createRowNode(timezones))

    const tld = {
        th: 'TLD',
        innerText: country['tld'].join(', '),
    }
    tbody.appendChild(createRowNode(tld))

    let currencyData = []
    for (const [k, v] of Object.entries(country['currencies'])) {
        currencyData.push(`${k} (${v['name']})`)
    }
    const currencies = {
        th: 'Currency',
        innerText: currencyData.join(', '),
    }
    tbody.appendChild(createRowNode(currencies))

    let languageData = []
    for (const [k, v] of Object.entries(country['languages'])) {
        languageData.push(v)
    }
    const languages = {
        th: 'Languages',
        innerText: languageData.join(', '),
    }
    tbody.appendChild(createRowNode(languages))

    const population = {
        th: 'Population',
        innerText: country['population'].toLocaleString('en-IN'),
    }
    tbody.appendChild(createRowNode(population))

    table.appendChild(tbody)
    cardBody.appendChild(table)

    const maps = {
        tag: 'a',
        class: ['btn', 'btn-primary'],
        innerText: 'open map',
        attributes: {
            href: country['maps']['googleMaps'],
            target: '_blank'
        }
    }
    cardBody.appendChild(createNode(maps))
    countryContainer.appendChild(cardBody)
}

const getACountry = async (e) => {
    e.preventDefault()
    clearNodes(countryContainer)
    const code = e.currentTarget.id.slice(5)
    countryLoading.style.display = 'block'
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${code}`, headers)
        if (response.ok) {
            const data = await response.json()
            countryLoading.style.display = 'none'
            const country = data[0]
            createCountryNodes(country)
        } else {
            throw new Error('unable to fetch country data, try again')
        }
    } catch (error) {
        console.log(error)
        alert('unable to fetch country data, try again')
    }
}

const createCovidNodes = (data, code) => {
    const heading = document.createElement('h3')
    heading.innerText = 'Covid Data'

    const tableContainer = document.createElement('div')
    tableContainer.classList.add('table-responsive')

    const table = document.createElement('table')
    table.classList.add('table', 'table-striped', 'table-hover', 'table-bordered')
    const thead = document.createElement('thead')
    const toprow = document.createElement('tr')

    const serial = document.createElement('th')
    serial.setAttribute('scope', 'col')
    serial.innerText = '#'
    toprow.appendChild(serial)

    tableHeaders.forEach(header => {
        const th = document.createElement('th')
        th.setAttribute('scope', 'col')
        th.innerText = header
        toprow.appendChild(th)
    })
    thead.appendChild(toprow)
    table.appendChild(thead)

    const tbody = document.createElement('tbody')

    data.forEach((entry, i) => {
        const row = document.createElement('tr')

        const pos = document.createElement('th')
        pos.setAttribute('scope', 'row')
        pos.innerText = `${i + 1}`
        row.appendChild(pos)

        tableHeaders.forEach(header => {
            const td = document.createElement('td')
            const info = entry[header]

            let delta = 0
            const deltaSpan = document.createElement('span')
            deltaSpan.innerText = '(+0)'

            if (header == 'Date') {
                td.innerText = info.slice(0, 10)
            } else {
                if (i < data.length - 1) {
                    delta = parseInt(info) - parseInt(data[i + 1][header])
                    if (delta > 0) {
                        deltaSpan.innerText = `(+${delta})`
                        deltaSpan.classList.add('badge', 'rounded-pill', 'badge-danger')
                    }
                    if (delta < 0) {
                        deltaSpan.innerText = `(${delta})`
                        deltaSpan.classList.add('badge', 'rounded-pill', 'badge-success')
                    }
                }
                const infoSpan = document.createElement('span')
                infoSpan.innerText = info.toLocaleString('en-IN')
                td.appendChild(infoSpan)
                td.appendChild(document.createTextNode('\u00A0\u00A0'))
                td.appendChild(deltaSpan)
            }
            row.appendChild(td)
        })
        tbody.appendChild(row)
    })
    table.appendChild(tbody)

    const moreDetails = document.createElement('button')
    moreDetails.classList.add('btn', 'btn-primary', 'mb-3')
    moreDetails.innerText = 'more details'
    moreDetails.setAttribute('id', `ISO2-${code}`)
    moreDetails.addEventListener('click', getACountry)

    covidContainer.appendChild(heading)
    covidContainer.appendChild(moreDetails)
    tableContainer.appendChild(table)
    covidContainer.appendChild(tableContainer)
}

const getACovid = async () => {
    const code = selected.slice(0, 2)
    const slug = selected.slice(3)
    covidLoading.style.display = 'block'
    try {
        const response = await fetch(`https://api.covid19api.com/total/country/${slug}`, headers)
        if (response.ok) {
            const data = await response.json()
            covidLoading.style.display = 'none'
            data.reverse()
            createCovidNodes(data, code)
        } else {
            throw new Error('unable to fetch Covid data, try again')
        }
    } catch (error) {
        console.log(error)
        alert('unable to fetch Covid data, try again')
    }
}

const selectAutocomplete = (e) => {
    clearNodes(autocomplete)
    selected = e.currentTarget.id
    searchBox.value = e.currentTarget.getAttribute('country').replaceAll('_', ' ')
    searchBtn.disabled = false
    currentFocus = -1
}

const input = () => {
    clearNodes(autocomplete)
    const inputStr = searchBox.value
    if (!inputStr) { return false }
    const inputStrLen = inputStr.length
    const matchedCountries = countries.filter(country => {
        const countryPart = country['Country'].toLowerCase().slice(0, inputStrLen)
        return countryPart === inputStr.toLowerCase()
    })
    const autocompleteList = document.createElement('div')
    autocompleteList.setAttribute('style', 'width: 209.432px; z-index: 99; top: 100%; left: 12px; right: 0;')
    autocompleteList.classList.add('position-absolute', 'border-start', 'border-end')

    matchedCountries.forEach(country => {
        const div = document.createElement('div')
        div.classList.add('autocomplete-item', 'border-bottom', 'p-1', 'bg-light')
        div.setAttribute('id', `${country['ISO2']}-${country['Slug']}`)
        div.setAttribute('country', country['Country'].replaceAll(' ', '_'))
        div.setAttribute('role', 'button')
        const strong = document.createElement('strong')
        strong.innerText = country['Country'].slice(0, inputStrLen)
        const span = document.createElement('span')
        span.innerText = country['Country'].slice(inputStrLen)
        div.appendChild(strong)
        div.appendChild(span)
        div.addEventListener('click', selectAutocomplete)
        autocompleteList.appendChild(div)
    })
    autocomplete.appendChild(autocompleteList)
}

const removeActive = (autocompleteItems) => {
    autocompleteItems.forEach(item => {
        item.classList.remove('autocomplete-active')
    })
}

const addActive = (autocompleteItems) => {
    if (!autocompleteItems) return false;
    removeActive(autocompleteItems)
    if (currentFocus >= autocompleteItems.length) currentFocus = 0
    if (currentFocus < 0) currentFocus = (autocompleteItems.length - 1)
    autocompleteItems[currentFocus].classList.add('autocomplete-active')
}

const keydown = (e) => {
    const autocompleteItems = document.querySelectorAll('.autocomplete-item')
    if (e.keyCode == 40) {
        // DOWN key
        currentFocus++
        addActive(autocompleteItems)
    } else if (e.keyCode == 38) {
        // UP key
        currentFocus--
        addActive(autocompleteItems)
    } else if (e.keyCode == 13) {
        //ENTER key
        e.preventDefault()
        if (currentFocus > -1 && autocompleteItems) {
            autocompleteItems[currentFocus].click()
            return
        }
        if (selected !== '') searchBtn.click()
    }
}

searchBox.addEventListener('keydown', keydown)

const search = (e) => {
    e.preventDefault()
    clearNodes(covidContainer)
    clearNodes(countryContainer)
    searchBtn.disabled = true
    getACovid()
}

const getAllCountries = async () => {
    try {
        const response = await fetch('https://api.covid19api.com/countries', headers)
        if (response.ok) {
            countries = await response.json()
            searchBox.disabled = false
        } else {
            throw new Error('unable to fetch required data, please reload the page')
        }
    } catch (error) {
        console.log(error)
        alert('unable to fetch required data, please reload the page')
    }
}

// initialize
countryLoading.style.display = 'none'
covidLoading.style.display = 'none'
getAllCountries()

searchBox.addEventListener('input', input)
searchBtn.addEventListener('click', search)
