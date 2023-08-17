# Necessary Files for installation
- mongodb-linux-x86_64-rhel80-6.0.4.tar
- mongosh-1.6.2-linux-x64.tar

# Install MongoDB Community Edition  

`tar -xvf mongodb-linux-x86_64-rhel80-6.0.4.tar -C /opt/mongodb-6.0.4`  
`cd /opt/mongodb-6.0.4`  
`sudo ln -s $(pwd)/bin/\* /usr/local/bin/`  
`mongod --config mongod.conf (run the mongodb server via daemon process)`  

Verify that MongoDB has started successfully by checking the process output for the following line:
[initandlisten] waiting for connections on port 27017

if you want to check mongodb logs run the following command in console.
  
`mongod`

# Install Mongosh
  
`tar -xvf mongosh-1.6.2-linux-x64.tar -C /opt/mongosh-1.6.2`  
`cd /opt/mongosh-1.6.2`  
`sudo ln -s $(pwd)/bin/\* /usr/local/bin/`  


### To add a user to the `staffs` collection in MongoDB, you can use the following command:  
`mongosh`  
`show databases`  
`use au-invoice-IF` 
```sql
db.staffs.insertOne({
    name: '山田 太郎',
    email: 'testUser@kddi.com',
    role: 'administrator',
    affiliation: 'KDDI廿一巴又開発1部',
    password: '$2a$10$IbsyQF0Xi8BK/MxgXOw13uR4sM8wsUdf5Dih5ujURKYYRDOHBH5r6'
});
```
### Explanation of fields:

- name: The user's full name.
- email: The user's email address.
- role: The user's role (e.g., administrator).
- affiliation: The user's affiliation or department.
- password: The user's hashed password.

### As an output following user will be added:
> email: testUser@kddi.com  
> password: Kddi@0077
