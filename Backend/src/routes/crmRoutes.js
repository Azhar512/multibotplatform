import express from 'express';
import authenticateToken from '../middleware/auth.js';
import HubSpotClient from 'hubspot';
import SalesforceClient from 'salesforce-api';
import * as ZOHOCRMSDK from '@zohocrm/nodejs-sdk-2.1';

const router = express.Router();

// Initialize Zoho CRM Client
const initializeZohoCRM = async () => {
  const environment = ZOHOCRMSDK.USDataCenter.PRODUCTION();
  const tokenStore = new ZOHOCRMSDK.FileStore('./zoho_token.txt');
  
  const userSignature = new ZOHOCRMSDK.UserSignature(process.env.ZOHO_EMAIL);
  
  const tokenParams = {
    client_id: process.env.ZOHO_CLIENT_ID,
    client_secret: process.env.ZOHO_CLIENT_SECRET,
    redirect_uri: process.env.ZOHO_REDIRECT_URI,
    grant_token: process.env.ZOHO_GRANT_TOKEN
  };

  try {
    await ZOHOCRMSDK.SDKInitializer.initialize({
      environment: environment,
      token: tokenStore,
      user: userSignature,
      tokenParams: tokenParams
    });

    return {
      Contacts: new ZOHOCRMSDK.ContactsOperations(),
      Deals: new ZOHOCRMSDK.DealsOperations()
    };
  } catch (error) {
    console.error('Zoho CRM Initialization Error:', error);
    throw error;
  }
};

// Preload CRM Clients
const initializeCRMClients = async () => {
  const zohoCRM = await initializeZohoCRM();

  return {
    hubspot: new HubSpotClient({ 
      apiKey: process.env.HUBSPOT_API_KEY 
    }),
    salesforce: new SalesforceClient({
      clientId: process.env.SALESFORCE_CLIENT_ID,
      clientSecret: process.env.SALESFORCE_CLIENT_SECRET,
      username: process.env.SALESFORCE_USERNAME,
      password: process.env.SALESFORCE_PASSWORD
    }),
    zoho: zohoCRM
  };
};

// Middleware to ensure CRM clients are initialized
const getCRMClients = async (req, res, next) => {
  try {
    if (!req.crmClients) {
      req.crmClients = await initializeCRMClients();
    }
    next();
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to initialize CRM clients', 
      details: error.message 
    });
  }
};

// Fetch Customer Profile
router.get('/customer', authenticateToken, getCRMClients, async (req, res) => {
  try {
    const { 
      phone, 
      email, 
      system = 'hubspot' 
    } = req.query;

    if (!req.crmClients[system]) {
      return res.status(400).json({ 
        error: 'Unsupported CRM system' 
      });
    }

    let customerProfile;
    switch (system) {
      case 'hubspot':
        customerProfile = await fetchHubSpotContact(req.crmClients.hubspot, phone, email);
        break;
      case 'salesforce':
        customerProfile = await fetchSalesforceContact(req.crmClients.salesforce, phone, email);
        break;
      case 'zoho':
        customerProfile = await fetchZohoContact(req.crmClients.zoho.Contacts, phone, email);
        break;
      default:
        throw new Error('CRM system not supported');
    }

    res.json({
      success: true,
      customer: customerProfile
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch customer profile', 
      details: error.message 
    });
  }
});

// Log Call Details
router.post('/log-call', authenticateToken, getCRMClients, async (req, res) => {
  try {
    const { 
      callData, 
      summary, 
      personalitySettings,
      system = 'hubspot'
    } = req.body;

    if (!req.crmClients[system]) {
      return res.status(400).json({ 
        error: 'Unsupported CRM system' 
      });
    }

    let logResult;
    switch (system) {
      case 'hubspot':
        logResult = await logCallToHubSpot(req.crmClients.hubspot, callData, summary, personalitySettings);
        break;
      case 'salesforce':
        logResult = await logCallToSalesforce(req.crmClients.salesforce, callData, summary, personalitySettings);
        break;
      case 'zoho':
        logResult = await logCallToZohoCRM(req.crmClients.zoho.Contacts, callData, summary, personalitySettings);
        break;
      default:
        throw new Error('CRM system not supported');
    }

    res.json({
      success: true,
      logResult
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to log call', 
      details: error.message 
    });
  }
});

// Create or Update Customer
router.post('/customer', authenticateToken, getCRMClients, async (req, res) => {
  try {
    const { 
      customerData, 
      system = 'hubspot' 
    } = req.body;

    if (!req.crmClients[system]) {
      return res.status(400).json({ 
        error: 'Unsupported CRM system' 
      });
    }

    let upsertResult;
    switch (system) {
      case 'hubspot':
        upsertResult = await upsertHubSpotContact(req.crmClients.hubspot, customerData);
        break;
      case 'salesforce':
        upsertResult = await upsertSalesforceContact(req.crmClients.salesforce, customerData);
        break;
      case 'zoho':
        upsertResult = await upsertZohoContact(req.crmClients.zoho.Contacts, customerData);
        break;
      default:
        throw new Error('CRM system not supported');
    }

    res.json({
      success: true,
      contact: upsertResult
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to create/update customer', 
      details: error.message 
    });
  }
});

// Utility Functions for Different CRM Systems
async function fetchHubSpotContact(hubspotClient, phone, email) {
  try {
    const searchCriteria = phone ? { phone } : { email };
    const contact = await hubspotClient.contacts.search(searchCriteria);
    return contact;
  } catch (error) {
    console.error('HubSpot fetch error:', error);
    throw error;
  }
}

async function fetchSalesforceContact(salesforceClient, phone, email) {
  try {
    const query = phone 
      ? `SELECT Id, Name, Phone, Email FROM Contact WHERE Phone = '${phone}'`
      : `SELECT Id, Name, Phone, Email FROM Contact WHERE Email = '${email}'`;
    
    const result = await salesforceClient.query(query);
    return result.records[0];
  } catch (error) {
    console.error('Salesforce fetch error:', error);
    throw error;
  }
}

async function fetchZohoContact(zohoContacts, phone, email) {
  try {
    const paramInstance = new ZOHOCRMSDK.ParameterMap();
    
    if (phone) {
      paramInstance.add(ZOHOCRMSDK.SearchContactsParam.PHONE, phone);
    }
    if (email) {
      paramInstance.add(ZOHOCRMSDK.SearchContactsParam.EMAIL, email);
    }

    const response = await zohoContacts.searchContacts(paramInstance);
    return response.getData();
  } catch (error) {
    console.error('Zoho fetch error:', error);
    throw error;
  }
}

async function logCallToHubSpot(hubspotClient, callData, summary, personalitySettings) {
  try {
    return await hubspotClient.engagements.create({
      engagement: {
        type: 'CALL',
        timestamp: Date.now()
      },
      associations: {
        contactIds: [callData.contactId],
        companyIds: [callData.companyId]
      },
      metadata: {
        ...callData,
        summary,
        personalityProfile: personalitySettings
      }
    });
  } catch (error) {
    console.error('HubSpot call log error:', error);
    throw error;
  }
}

async function logCallToSalesforce(salesforceClient, callData, summary, personalitySettings) {
  try {
    return await salesforceClient.sobject('Task').create({
      Subject: 'Call Logged',
      Description: summary,
      WhoId: callData.contactId,
      WhatId: callData.companyId,
      CallType: 'Inbound',
      Status: 'Completed',
      Custom_Personality_Profile__c: JSON.stringify(personalitySettings)
    });
  } catch (error) {
    console.error('Salesforce call log error:', error);
    throw error;
  }
}

async function logCallToZohoCRM(zohoContacts, callData, summary, personalitySettings) {
  try {
    const callRecord = new ZOHOCRMSDK.BodyWrapper();
    const calls = [];
    
    const call = new ZOHOCRMSDK.Calls();
    call.setContactName(callData.contactId);
    call.setCallSummary(summary);
    call.setCallPurpose('Customer Interaction');
    call.setPersonalityProfile(JSON.stringify(personalitySettings));
    
    calls.push(call);
    callRecord.setData(calls);

    return await zohoContacts.createCalls(callRecord);
  } catch (error) {
    console.error('Zoho call log error:', error);
    throw error;
  }
}

async function upsertHubSpotContact(hubspotClient, customerData) {
  try {
    return await hubspotClient.contacts.createOrUpdate(
      customerData.email, 
      customerData
    );
  } catch (error) {
    console.error('HubSpot upsert error:', error);
    throw error;
  }
}

async function upsertSalesforceContact(salesforceClient, customerData) {
  try {
    return await salesforceClient.sobject('Contact').upsert(
      'Email', 
      customerData
    );
  } catch (error) {
    console.error('Salesforce upsert error:', error);
    throw error;
  }
}

async function upsertZohoContact(zohoContacts, customerData) {
  try {
    const contactRecord = new ZOHOCRMSDK.BodyWrapper();
    const contacts = [];
    
    const contact = new ZOHOCRMSDK.Contacts();
    Object.keys(customerData).forEach(key => {
      contact.setFieldValue(key, customerData[key]);
    });
    
    contacts.push(contact);
    contactRecord.setData(contacts);

    return await zohoContacts.createContacts(contactRecord);
  } catch (error) {
    console.error('Zoho upsert error:', error);
    throw error;
  }
}

export default router;