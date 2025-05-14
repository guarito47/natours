const az_identity= require('@azure/identity');
const az_kv= require('@azure/keyvault-secrets');


//this funcxtion will get the secret from azure key vault
//we need to set the enviroment variable KEY_VAULT_HOST with the name of the key vault
const getSecret = async secretName => {
  
  const credential= new az_identity.DefaultAzureCredential();
  const client= new az_kv.SecretClient(`https://${process.env.KEY_VAULT_HOST}.vault.azure.net`, credential);
  
  const secret= await client.getSecret(secretName)
  return secret;
};

module.exports = getSecret;
