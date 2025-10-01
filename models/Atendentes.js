// importando arquivo de config do banco
const db = require("./db");

// abaixo exemplo que cria a tabela produtos com os campos descritos
const Atendente = db.sequelize.define("atendentes", {
  nome: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  email: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  senha: {
    type: db.Sequelize.STRING,
    allowNull: false,
  },
  ativo: {
    type: db.Sequelize.BOOLEAN,
    allowNull: false,
  },
});

// comando sync realiza a criação da tabela
Atendente.sync({ force: false });

module.exports = Atendente;
