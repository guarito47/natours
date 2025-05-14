const az_identity= require('@azure/identity');
const az_kv= require('@azure/keyvault-secrets');


//options is the object that contains the email To, subject, message etc
const getSecret = async secretName => {
  // 1) Create a transporter
  const credential= new az_identity.DefaultAzureCredential();
  const client= new az_kv.SecretClient(`https://${process.env.KEY_VAULT_HOST}.vault.azure.net`, credential);
  
  const secret= await client.getSecret(secretName)
  return secret;
};

module.exports = getSecret;
