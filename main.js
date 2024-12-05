const { listFormsWithoutUserDeal } = require('./queries');
const { findReportsInDealsForUser } = require('./jose');

// Ejecuta la función basada en el nombre proporcionado
async function runFunction(functionName, ...args) {
  switch (functionName) {
    case 'listFormsWithoutUserDeal':
      await listFormsWithoutUserDeal();
      break;
      case 'findReportsInDealsForUser':
        await findReportsInDealsForUser(...args);
        break; 
    default:
      console.log('Función no válida.');
  }
}

runFunction('findReportsInDealsForUser', '84261000-7176-11ed-bc4f-97c520854d14');