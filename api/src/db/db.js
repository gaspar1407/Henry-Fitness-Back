require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const { DATABASE_URL } = process.env;

const sequelize = new Sequelize(DATABASE_URL, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "../models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "../models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring

const {
  Admin,
  Activity,
  Classpass,
  Gym,
  Payment_order,
  Professional,
  Rating,
  User,
} = sequelize.models;

/*Classpass.belongsToMany(Activity, {through: "classpass_activity" , timestamps: false});
Activity.belongsToMany(Classpass, {through: "classpass_activity" , timestamps: false});*/

Activity.belongsToMany(Professional, {
  through: "activity_professional",
  timestamps: false,
});
Professional.belongsToMany(Activity, {
  through: "activity_professional",
  timestamps: false,
});

Classpass.belongsToMany(Payment_order, {
  through: "classpass_payment_order",
  timestamps: false,
});
Payment_order.belongsToMany(Classpass, {
  through: "classpass_payment_order",
  timestamps: false,
});

Activity.hasMany(Classpass);
Classpass.belongsTo(Activity);

Activity.hasMany(Rating);
Rating.belongsTo(Activity);

User.hasMany(Rating);
Rating.belongsTo(User);

User.hasMany(Payment_order);
Payment_order.belongsTo(User);

module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
