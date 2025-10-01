// importando arquivo de config do banco
const db = require("./db");

// abaixo exemplo que cria a tabela  com os campos descritos
const Guiche = db.sequelize.define("guiches", {
  nome: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  ativo: {
    type: db.Sequelize.BOOLEAN,
    allowNull: false,
  },
});

// comando sync realiza a criação da tabela
Guiche.sync({ force: false });

module.exports = Guiche;
