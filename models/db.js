// Sequelize é resposavel por fazer a ponte com o banco de dados

// instanciando o sequelize
const Sequelize = require("sequelize");

// configurando a conexão com o banco
const sequelize = new Sequelize(
  "sistemasenhas", // banco
  "root", // usuario
  "123456", // senha
  {
    host: "192.168.18.77", // endereço banco
    port: "3307",
    dialect: "mysql", // qual sgbd
  }
);

// autenticando no banco
sequelize
  .authenticate()
  .then(function () {
    console.log("banco de dados conectado com sucesso");
  })
  .catch(function (erro) {
    console.log("banco de dados - erro na conexão erro:" + erro);
  });

// exportando modulos para ser utilizados na aplicação
module.exports = {
  Sequelize: Sequelize,
  sequelize: sequelize,
};
