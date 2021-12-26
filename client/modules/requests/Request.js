module.exports = {

    _callbacks: { },

    addRequest: function(_case, func){
       this._callbacks[_case] = this._callbacks[_case] || [];
       this._callbacks[_case].push(func);
    },

    matchRequestType: function(socket, request){
       let data = socket.get(request, true);
       if(this._callbacks[data.header.type]) this._callbacks[data.header.type].forEach(func => func(socket, data));
       else console.log('Request not found');
    }

}