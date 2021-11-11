module.exports = (type, data) => {
    if(type === 'err') JSON.stringify({err: data});
    
}
