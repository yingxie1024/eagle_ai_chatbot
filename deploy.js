const axios = require('axios');

const AI_BUILDERS_BASE_URL = 'https://space.ai-builders.com/backend';
const AI_BUILDER_TOKEN = process.env.AI_BUILDER_TOKEN || 'sk_f274487b_a104ea6534bd9afc36a440984d2506e59c65';

async function deploy() {
  const deploymentRequest = {
    repo_url: 'https://github.com/yingxie1024/eagle_ai_chatbot',
    service_name: 'eagle-ai',
    branch: 'main',
    port: 8000
  };

  try {
    console.log('Deploying to AI Builders platform...');
    console.log('Repository:', deploymentRequest.repo_url);
    console.log('Service name:', deploymentRequest.service_name);
    console.log('Branch:', deploymentRequest.branch);
    
    const response = await axios.post(
      `${AI_BUILDERS_BASE_URL}/v1/deployments`,
      deploymentRequest,
      {
        headers: {
          'Authorization': `Bearer ${AI_BUILDER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Deployment queued successfully!');
    console.log('\nDeployment Details:');
    console.log('- Service Name:', response.data.service_name);
    console.log('- Status:', response.data.status);
    console.log('- Public URL:', response.data.public_url || 'Will be available after deployment completes');
    console.log('\n⏳ Deployment typically takes 5-10 minutes.');
    console.log('You can check the status using the Deployment Portal or API.');
    
    if (response.data.message) {
      console.log('\nMessage:', response.data.message);
    }
    
    if (response.data.streaming_logs) {
      console.log('\nInitial Build Logs:');
      console.log(response.data.streaming_logs);
    }

  } catch (error) {
    console.error('\n❌ Deployment failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

deploy();

