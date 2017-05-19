let colophon = () => {
	let date = new Date
	let now = date.getFullYear()
	let then = document.querySelector('#colophon time').innerText
	return (now >= then) ? then + " - " + now : now
}

document.querySelector('#colophon time').innerHTML = colophon()
