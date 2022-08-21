let db = require('./postgresql');


class Table {

    constructor(table_name, table_columns){
        this.name = table_name;
        this.columns = table_columns;
    }

    async create(other){
        let columns = '', columnsArray = Object.entries(this.columns);
        for (let i = 0; i < columnsArray.length; i++) {
            columns += `${columnsArray[i][0]} ${columnsArray[i][1]}`;
            if(i < columnsArray.length-1) columns += ', ';
        }
        other = other ? `,${other}` : '';
        await db.query(`CREATE TABLE IF NOT EXISTS ${this.name}(${columns}${other});`);
    }

    async insert(object){
        let columns = Object.keys(object), values = Object.values(object);
        let text = `INSERT INTO ${this.name}(`;
        columns.forEach((key, i) => i != columns.length-1 ? text += `${key}, ` : text += `${key}) VALUES(`);
        for(let i = 1; i <= values.length; i++){
            if(i != columns.length) text += `$${i}, `;
            else text += `$${i}) RETURNING *;`;
        }
        return await db.query(text, values);
    }

    async find(objectFindBy, select, returnNull, other){
        let columns, values;
        let text = select ? `SELECT ` : `SELECT * `;
        if(select) select.forEach((key, i) => i < select.length-1 ? text += `${key}, ` : text += `${key} `);
        text += `FROM ${this.name}`;
        if(objectFindBy){
            columns = Object.keys(objectFindBy);
            values = Object.values(objectFindBy);
            text += ` WHERE `;
            for(let i=0; i < columns.length; i++){
                text += `${columns[i]}=$${i+1}`;
                if(i < columns.length-1) text += ' and ';
            }
        }
        if(other) text += ` ${other}`;
        return await db.query(text, values, returnNull);
    }

    async delete(objectFindBy, other){
        let columns = Object.keys(objectFindBy);
        let values = Object.values(objectFindBy);
        let text = `DELETE FROM ${this.name} WHERE `;
        for(let i=0; i < columns.length; i++){
            text += `${columns[i]}=$${i+1}`;
            if(i < columns.length-1) text += ' and ';
        }
        if(other) text += other;
        return await db.query(text, values);
    }

    async update(objectFindBy, objectUpdate, other){
        let valuesLen = 1;
        let columnsFind = Object.keys(objectFindBy);
        let columnsUpdate = Object.keys(objectUpdate);
        let values = [...Object.values(objectUpdate), ...Object.values(objectFindBy)];
        let text = `UPDATE ${this.name} SET `;
        for(let i=0; i < columnsUpdate.length; i++){
            text += `${columnsUpdate[i]}=$${valuesLen}`;
            if(i < columnsUpdate.length-1) text += ', ';
            valuesLen++;
        }
        text += ` WHERE `;
        for(let i=0; i < columnsFind.length; i++){
            text += `${columnsFind[i]}=$${valuesLen}`;
            if(i < columnsFind.length-1) text += ' and ';
            valuesLen++;
        }
        if(other) text += ` ${other}`;
        return await db.query(text, values);
    }
}
module.exports = Table;