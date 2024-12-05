const { clientUsers, clientCompliance, connectDatabases, closeDatabases } = require('./db-connections');

async function findReportsInDealsForUser(ownerId) {
    await connectDatabases();
  
    try {
      const dealQuery = `
        SELECT id, "ownerId"
        FROM public."Deals"
        WHERE "ownerId" = $1; 
      `;
      
      const dealsResult = await clientUsers.query(dealQuery, [ownerId]); 
      if (dealsResult.rows.length === 0) {
        console.log('No se encontraron deals para este ownerId');
        return;
      }
  
      const dealIds = dealsResult.rows.map(row => row.id);
  
      const formsQuery = `
        SELECT id, code, "dealId", "authorId"
        FROM public."Forms"
        WHERE type IN ('EL', 'AMN_EL', 'FSA_INT', 'FSA_EXT', 'MMAT', 'DRA', 'KYC', 'KYC_CL', 'KYC_CO', 'CDOC', 'INV')
        AND "dealId" IN (${dealIds.map((dealId, index) => `$${index + 1}`).join(', ')});
      `;
  
      const formsResult = await clientCompliance.query(formsQuery, dealIds); 
  
      if (formsResult.rows.length === 0) {
        console.log('No se encontraron formularios para los deals');
        return;
      }
  
      console.log(formsResult.rows);
  
    } catch (err) {
      console.error('Hubo un error:', err);
    } finally {
      await closeDatabases();
    }
  }
  
  module.exports = {
    findReportsInDealsForUser,
  };