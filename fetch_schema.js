import fs from 'fs';

async function main() {
  const url = 'https://ucbxfjiskjwxhavwrvsm.supabase.co/rest/v1/?apikey=sb_publishable_ycDIXrws-IYKw1S44lzQGw_xSXSY8fp';
  try {
    const res = await fetch(url);
    const data = await res.json();
    
    // Save full schema to a file for reference
    fs.writeFileSync('db_openapi.json', JSON.stringify(data, null, 2));
    console.log('Successfully saved OpenAPI schema to db_openapi.json');
    
    // Print out the tables and their properties
    const definitions = data.definitions || {};
    for (const tableName in definitions) {
      console.log(`\nTable: ${tableName}`);
      const properties = definitions[tableName].properties || {};
      for (const propName in properties) {
        const prop = properties[propName];
        console.log(`  - ${propName}: ${prop.type} (${prop.format || ''})`);
      }
    }
  } catch (err) {
    console.error('Error fetching schema:', err);
  }
}

main();
