let User = require('../../mongodb/schema');

module.exports = (type) => {
   let user = new User({
       username: 'Elch',
       password: '123',
       socket_id: 'frdger-54h-34dew-7ujtfh',
       сonversations: ['1', '2', '3']
    
   }).save((err)=>{
       if(err) throw err;
       else console.log('User created successfully');
   });
}