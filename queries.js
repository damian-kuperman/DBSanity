const { clientUsers, clientCompliance, connectDatabases, closeDatabases } = require('./db-connections');

// Función para listar formularios donde el authorId ya no está asociado al deal, junto con el owner del deal
async function listFormsWithoutUserDeal() {
  await connectDatabases();

  try {
    // Paso 1: Obtener los formularios "deal-related" con un dealId válido desde compliance
    const formsQuery = `
      SELECT id, code, "dealId", "authorId"
      FROM public."Forms"
      WHERE type IN ('EL', 'AMN_EL', 'FSA_INT', 'FSA_EXT', 'MMAT', 'DRA', 'KYC', 'KYC_CL', 'KYC_CO', 'CDOC', 'INV')
      AND "dealId" IS NOT NULL;
    `;
    const forms = await clientCompliance.query(formsQuery);
    const dealIds = forms.rows.map(form => form.dealId);
    const authorAndDealPairs = forms.rows.map(form => [form.authorId, form.dealId]);

    // Paso 2: Obtener todos los ownerId para los dealId en una sola consulta
    const dealQuery = `
      SELECT id, "ownerId"
      FROM public."Deals"
      WHERE id = ANY($1::uuid[]);
    `;
    const deals = await clientUsers.query(dealQuery, [dealIds]);

    // Almacenar los ownerId en un objeto para acceso rápido
    const ownerIdCache = {};
    deals.rows.forEach(deal => {
      ownerIdCache[deal.id] = deal.ownerId;
    });

    // Paso 3: Verificar todas las relaciones en UserDeals en una sola consulta
    const userDealsQuery = `
      SELECT "userId", "dealId"
      FROM public."UserDeals"
      WHERE ("userId", "dealId") IN (SELECT unnest($1::uuid[]), unnest($2::uuid[]));
    `;
    const userDeals = await clientUsers.query(userDealsQuery, [
      authorAndDealPairs.map(pair => pair[0]), // Lista de userId
      authorAndDealPairs.map(pair => pair[1])  // Lista de dealId
    ]);

    // Convertir userDeals en un Set para rápido acceso
    const userDealsSet = new Set(userDeals.rows.map(row => `${row.userId}-${row.dealId}`));

    const formsWithoutRelation = [];

    // Paso 4: Revisar cada formulario y verificar si hay relación en UserDeals
    for (const form of forms.rows) {
      const relationExists = userDealsSet.has(`${form.authorId}-${form.dealId}`);

      // Si no existe la relación en UserDeals, agregar el formulario a la lista
      if (!relationExists) {
        const ownerId = ownerIdCache[form.dealId];
        
        // Agregar a la lista para posibles procesamientos futuros
        formsWithoutRelation.push({
          form_id: form.id,
          code: form.code,
          deal_id: form.dealId,
          author_id: form.authorId,
          deal_owner_id: ownerId
        });
      }
    }

    // Mostrar el listado de formularios sin relación
    if (formsWithoutRelation.length > 0) {
      console.log('Listado de Forms cuyo auto y deal no tienen relación en UserDeals:', formsWithoutRelation);
    } else {
      console.log('No se encontraron formularios sin relación con el deal.');
    }

  } catch (err) {
    console.error('Error en la función listFormsWithoutUserDeal', err);
  } finally {
    await closeDatabases();
  }
}

module.exports = {
  listFormsWithoutUserDeal,
};
