import HubSpot from '@hubspot/api-client';
import jsforce from 'jsforce';
import * as ZOHOCRMSDK from '@zohocrm/nodejs-sdk-2.1';

class CRMService {
  constructor(config) {
    this.config = config;
    this.clients = {
      hubspot: null,
      salesforce: null,
      zoho: null
    };
    this.initializeClients();
  }

  async initializeClients() {
    // Initialize HubSpot API client
    if (this.config.HUBSPOT_API_KEY) {
      this.clients.hubspot = new HubSpot.Client({ accessToken: this.config.HUBSPOT_API_KEY });
    }

    // Initialize Salesforce connection
    if (this.config.SALESFORCE_CONFIG) {
      this.clients.salesforce = new jsforce.Connection({
        loginUrl: this.config.SALESFORCE_CONFIG.loginUrl
      });
      try {
        await this.clients.salesforce.login(
          this.config.SALESFORCE_CONFIG.username,
          this.config.SALESFORCE_CONFIG.password + this.config.SALESFORCE_CONFIG.securityToken
        );
      } catch (err) {
        console.error("Salesforce login error:", err);
      }
    }

    // Initialize Zoho CRM SDK
    if (this.config.ZOHO_CONFIG) {
      try {
        const environment = ZOHOCRMSDK.USDataCenter.PRODUCTION();
        const tokenStore = new ZOHOCRMSDK.FileStore('./zoho_token.txt');
        
        const userSignature = new ZOHOCRMSDK.UserSignature(this.config.ZOHO_CONFIG.email);
        
        const tokenParams = {
          client_id: this.config.ZOHO_CONFIG.client_id,
          client_secret: this.config.ZOHO_CONFIG.client_secret,
          redirect_uri: this.config.ZOHO_CONFIG.redirect_uri,
          grant_token: this.config.ZOHO_CONFIG.grant_token
        };

        await ZOHOCRMSDK.SDKInitializer.initialize({
          environment: environment,
          token: tokenStore,
          user: userSignature,
          tokenParams: tokenParams
        });

        this.clients.zoho = {
          contacts: new ZOHOCRMSDK.ContactsOperations(),
          calls: new ZOHOCRMSDK.CallsOperations()
        };
      } catch (error) {
        console.error("Zoho CRM initialization error:", error);
      }
    }
  }

  async fetchCustomerData(phoneNumber, crmSystem) {
    const client = this.clients[crmSystem];
    if (!client) throw new Error(`CRM system ${crmSystem} not configured`);

    try {
      switch (crmSystem) {
        case 'hubspot':
          return await this.getHubSpotContact(phoneNumber);
        case 'salesforce':
          return await this.getSalesforceContact(phoneNumber);
        case 'zoho':
          return await this.getZohoContact(phoneNumber);
        default:
          throw new Error('Unsupported CRM system');
      }
    } catch (error) {
      console.error(`CRM data fetch error for ${crmSystem}:`, error);
      throw error;
    }
  }

  async getHubSpotContact(phoneNumber) {
    const searchResponse = await this.clients.hubspot.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [{ propertyName: "phone", operator: "EQ", value: phoneNumber }]
        }
      ],
      properties: ['firstname', 'lastname', 'email', 'phone', 'company']
    });
    return searchResponse.results?.[0] || null;
  }

  async getSalesforceContact(phoneNumber) {
    const records = await this.clients.salesforce.sobject('Contact')
      .find({ Phone: phoneNumber })
      .limit(1);
    return records[0] || null;
  }

  async getZohoContact(phoneNumber) {
    try {
      const paramInstance = new ZOHOCRMSDK.ParameterMap();
      paramInstance.add(ZOHOCRMSDK.SearchContactsParam.PHONE, phoneNumber);

      const response = await this.clients.zoho.contacts.searchContacts(paramInstance);
      const contactsData = response.getData();
      
      return contactsData.length > 0 ? contactsData[0] : null;
    } catch (error) {
      console.error('Zoho contact search error:', error);
      return null;
    }
  }

  async logCall(callData, summary, crmSystem) {
    const client = this.clients[crmSystem];
    if (!client) throw new Error(`CRM system ${crmSystem} not configured`);

    try {
      switch (crmSystem) {
        case 'hubspot':
          return await this.logHubSpotCall(callData, summary);
        case 'salesforce':
          return await this.logSalesforceCall(callData, summary);
        case 'zoho':
          return await this.logZohoCall(callData, summary);
        default:
          throw new Error('Unsupported CRM system');
      }
    } catch (error) {
      console.error(`Call logging error for ${crmSystem}:`, error);
      throw error;
    }
  }

  async logHubSpotCall(callData, summary) {
    return this.clients.hubspot.crm.engagements.basicApi.create({
      engagement: {
        active: true,
        type: "CALL"
      },
      associations: [],
      metadata: {
        durationMilliseconds: callData.duration * 1000,
        body: summary.transcript
      }
    });
  }

  async logSalesforceCall(callData, summary) {
    return this.clients.salesforce.sobject('Task').create({
      Subject: 'Call Log',
      Description: summary.transcript,
      CallType: callData.type,
      CallDurationInSeconds: callData.duration
    });
  }

  async logZohoCall(callData, summary) {
    try {
      const callRecord = new ZOHOCRMSDK.BodyWrapper();
      const calls = [];
      
      const call = new ZOHOCRMSDK.Calls();
      call.setCallDuration(callData.duration.toString());
      call.setCallSummary(summary.transcript);
      
      calls.push(call);
      callRecord.setData(calls);

      return await this.clients.zoho.calls.createCalls(callRecord);
    } catch (error) {
      console.error('Zoho call logging error:', error);
      throw error;
    }
  }
}

export default CRMService;