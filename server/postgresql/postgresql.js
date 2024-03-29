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
            username: 'VARCHAR(20) UNIQUE NOT NULL',
            password: 'CHAR(128) NOT NULL',
            salt: 'CHAR(32)'
        });
        await Users.create();
        
        Groups = new Table('groups', {
            id: 'serial PRIMARY KEY',
            fk_admin: 'INT REFERENCES users(id)',
            name: 'VARCHAR(20) UNIQUE NOT NULL',
            private: 'BOOLEAN NOT NULL',
            link: 'VARCHAR(40) UNIQUE NOT NULL'
        });
        await Groups.create();
        
        NewUsers = new Table('newusers', {
            id: 'serial PRIMARY KEY',
            fk_user: 'INT REFERENCES users(id)',
            fk_group: 'INT REFERENCES groups(id) ON DELETE CASCADE'
        });
        await NewUsers.create('UNIQUE (fk_user, fk_group)');
        
        UserGroups = new Table('usergroups', {
            id: 'serial PRIMARY KEY',
            fk_user: 'INT REFERENCES users(id)',
            fk_group: 'INT REFERENCES groups(id) ON DELETE CASCADE'
        });
        await UserGroups.create('UNIQUE (fk_user, fk_group)');
        console.log('PostgreSQL is connected');

    } catch(err) {
        console.log(`PostgreSQL init error: ${err}`);
    }
}

module.exports.query = async (text, values, returnNull=true) => { 
    let res = await client.query(text, values);
    return res.rows == 0 && returnNull ? null : res.rows;
};
module.exports.Users = () => Users;
module.exports.Groups = () => Groups;
module.exports.UserGroups = () => UserGroups;
module.exports.NewUsers = () => NewUsers;