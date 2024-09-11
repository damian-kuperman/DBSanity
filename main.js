const { listFormsWithoutUserDeal } = require('./queries');


// Ejecuta la función basada en el nombre proporcionado
async function runFunction(functionName) {
  switch (functionName) {
    case 'listFormsWithoutUserDeal':
      await listFormsWithoutUserDeal();
      break;
    default:
      console.log('Función no válida. Usa "listFormsWithoutUserDeal" para ejecutar esa función.');
  }
}

runFunction('listFormsWithoutUserDeal');
