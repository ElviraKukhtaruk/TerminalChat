module.exports = () => {
    	let date = new Date();
   	let minutes = date.getMinutes();
            minutes = minutes < 10 ? "0"+minutes : minutes;
   	let hours = date.getHours();
            hours = hours < 10 ? "0"+hours : hours;
    	return `${hours}:${minutes}`;
}
