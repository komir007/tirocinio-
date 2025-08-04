uso Windows con WSL nel terminale / docker compose non funzione corretamente

/-------------------------------------------------------------------------------------------------------------------------------/

//creazione database
// Per creare il database MySQL e l'utente, esegui i seguenti comandi nel terminale:
// Assicurati di avere Docker installato e in esecuzione.

docker run --name my-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=miodb -e MYSQL_USER=devuser -e MYSQL_PASSWORD=devpass -p 3306:3306 -d mysql:8.0

/-------------------------------------------------------------------------------------------------------------------------------/
//creare il il file .env nel backend, percorso ./backend/.env 
e copiare:
DATABASE_URL="mysql://devuser:devpass@localhost:3306/miodb"


/-------------------------------------------------------------------------------------------------------------------------------/

//aprire il terminale nel directry del progetto ed eseguire i seguenti comandi.

cd ./backend
npm install
npm run start:dev

/-------------------------------------------------------------------------------------------------------------------------------/


// aprire un nuovo terminale ed eseguire :
docker exec -it my-mysql mysql -u devuser -pdevpass -D miodb
 
USE miodb;

INSERT INTO user (name, email, password, role) VALUES ('mario rossi', 'mariorossi@gmail.com', '$2a$10$XoGDrM5EfdLtEA0ZPJBMAupnN89j0i.2njxkkjNmeYxyEtrEK4u5C', 'admin');




/-------------------------------------------------------------------------------------------------------------------------------/
//aprire in un nuovo terminale ed eseguire

cd ./frontend
npm install
npm run dev

/-------------------------------------------------------------------------------------------------------------------------------/
http://localhost:3000/

login :
email : mariorossi@gmail.com
password : 1234567










