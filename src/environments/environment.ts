// Configuration utilisée par `ng build` (production).
// Remplacer apiUrl par l'URL du backend déployé (ex. : https://mon-api.onrender.com/api).
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8080/api',
  shopName: 'DeliveryCommands',
  contact: {
    email: 'contact@exemple.ma',
    phone: '+212 5 00 00 00 00',
    address: 'Marrakech, Maroc',
    hours: 'Lundi – samedi : 9h30 – 22h30'
  }
};
