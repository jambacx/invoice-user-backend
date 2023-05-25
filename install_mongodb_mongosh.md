- mongodb-linux-x86_64-rhel80-6.0.4.tar
- mongosh-1.6.2-linux-x64.tar

# Install MongoDB Community Edition

- tar -xvf mongodb-linux-x86_64-rhel80-6.0.4.tar -C /opt/mongodb-6.0.4
- cd /opt/mongodb-6.0.4
- sudo ln -s $(pwd)/bin/\* /usr/local/bin/
- mongod --config mongod.conf (run the mongodb server via daemon process)

Verify that MongoDB has started successfully by checking the process output for the following line:
[initandlisten] waiting for connections on port 27017

if you want to check mongodb logs run the following command in console.

- mongod

# Intall Mongosh

- tar -xvf mongosh-1.6.2-linux-x64.tar -C /opt/mongosh-1.6.2
- cd /opt/mongosh-1.6.2
- sudo ln -s $(pwd)/bin/\* /usr/local/bin/

if you want to connect to the mongodb run the following command in console.

- mongosh
