const { Client } = require('pg');
const config = require('../configuration/mainConfig');
const Table = require('./TableClass');

let Users, Groups, NewUsers, UserGroups;

const client = new Client({ 
	user: config.DB.user, 
	host: config.DB.host,  
	database: config.DB.database, 
	password: config.DB.password, 
	port: config.DB.port
});

module.exports.init = async () => { 
	try {
	    await client.connect();

        Users = new Table('users', {
            id: 'serial PRIMARY KEY',
            socket_id: 'CHAR(36) UNIQUE',
            username: 'VARCHAR(20) UNIQUE NOT NULL',
            password: 'CHAR(128) NOT NULL',
            salt: 'CHAR(32)'
        });
        await Users.create();
        
        Groups = new Table('groups', {
            id: 'serial PRIMARY KEY',
            fk_admin: 'INT REFERENCES users(id)',
            name: 'VARCHAR(20) UNIQUE NOT NULL'
        });
        await Groups.create();
        
        NewUsers = new Table('newusers', {
            id: 'serial PRIMARY KEY',
            fk_user: 'INT REFERENCES users(id)',
            fk_group: 'INT REFERENCES groups(id) ON DELETE CASCADE'
        });
        await NewUsers.create();
        
        UserGroups = new Table('usergroups', {
            id: 'serial PRIMARY KEY',
            fk_user: 'INT REFERENCES users(id)',
            fk_group: 'INT REFERENCES groups(id) ON DELETE CASCADE'
        });
        await UserGroups.create();
        console.log('PostgreSQL is connected');

    } catch(err) {
        console.log(`PostgreSQL init error: ${err}`);
    }
}

module.exports.query = async (text, values) => { 
    let res = await client.query(text, values);
    return res.rows == 0 ? null : res.rows;
};
module.exports.Users = () => Users;
module.exports.Groups = () => Groups;
module.exports.UserGroups = () => UserGroups;
module.exports.NewUsers = () => NewUsers;