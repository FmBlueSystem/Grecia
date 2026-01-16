// In-memory database for MVP (sin PostgreSQL)
import { randomUUID } from 'crypto';

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  company?: string;
  leadSource?: string;
  tags: string[];
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Opportunity {
  id: string;
  name: string;
  amount: number;
  currency: string;
  stage: string;
  probability: number;
  closeDate: string;
  accountName: string;
  contactName: string;
  ownerId: string;
  isClosed: boolean;
  isWon?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  activityType: string;
  subject: string;
  description?: string;
  dueDate?: string;
  status: string;
  priority?: string;
  contactId?: string;
  opportunityId?: string;
  ownerId: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

class Database {
  private users: Map<string, User> = new Map();
  private contacts: Map<string, Contact> = new Map();
  private opportunities: Map<string, Opportunity> = new Map();
  private activities: Map<string, Activity> = new Map();

  constructor() {
    this.seedData();
  }

  // Users
  getUsers() {
    return Array.from(this.users.values());
  }

  getUserById(id: string) {
    return this.users.get(id);
  }

  getUserByEmail(email: string) {
    return this.getUsers().find((u) => u.email === email);
  }

  createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) {
    const newUser: User = {
      ...user,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  // Contacts
  getContacts(ownerId?: string) {
    const contacts = Array.from(this.contacts.values());
    if (ownerId) {
      return contacts.filter((c) => c.ownerId === ownerId && c.isActive);
    }
    return contacts.filter((c) => c.isActive);
  }

  getContactById(id: string) {
    return this.contacts.get(id);
  }

  createContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) {
    const newContact: Contact = {
      ...contact,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.contacts.set(newContact.id, newContact);
    return newContact;
  }

  updateContact(id: string, data: Partial<Contact>) {
    const contact = this.contacts.get(id);
    if (!contact) return null;

    const updated: Contact = {
      ...contact,
      ...data,
      id: contact.id,
      updatedAt: new Date().toISOString(),
    };
    this.contacts.set(id, updated);
    return updated;
  }

  deleteContact(id: string) {
    const contact = this.contacts.get(id);
    if (!contact) return false;

    contact.isActive = false;
    contact.updatedAt = new Date().toISOString();
    this.contacts.set(id, contact);
    return true;
  }

  // Opportunities
  getOpportunities(ownerId?: string) {
    const opps = Array.from(this.opportunities.values());
    if (ownerId) {
      return opps.filter((o) => o.ownerId === ownerId);
    }
    return opps;
  }

  getOpportunityById(id: string) {
    return this.opportunities.get(id);
  }

  createOpportunity(opp: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) {
    const newOpp: Opportunity = {
      ...opp,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.opportunities.set(newOpp.id, newOpp);
    return newOpp;
  }

  updateOpportunity(id: string, data: Partial<Opportunity>) {
    const opp = this.opportunities.get(id);
    if (!opp) return null;

    const updated: Opportunity = {
      ...opp,
      ...data,
      id: opp.id,
      updatedAt: new Date().toISOString(),
    };
    this.opportunities.set(id, updated);
    return updated;
  }

  deleteOpportunity(id: string) {
    return this.opportunities.delete(id);
  }

  // Activities
  getActivities(ownerId?: string) {
    const acts = Array.from(this.activities.values());
    if (ownerId) {
      return acts.filter((a) => a.ownerId === ownerId);
    }
    return acts;
  }

  getActivityById(id: string) {
    return this.activities.get(id);
  }

  createActivity(act: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) {
    const newAct: Activity = {
      ...act,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.activities.set(newAct.id, newAct);
    return newAct;
  }

  updateActivity(id: string, data: Partial<Activity>) {
    const act = this.activities.get(id);
    if (!act) return null;

    const updated: Activity = {
      ...act,
      ...data,
      id: act.id,
      updatedAt: new Date().toISOString(),
    };
    this.activities.set(id, updated);
    return updated;
  }

  deleteActivity(id: string) {
    return this.activities.delete(id);
  }

  // Seed initial data
  private seedData() {
    // Crear usuario por defecto
    const defaultUser: User = {
      id: 'user-1',
      email: 'freddy@bluesystem.com',
      password: '$2b$10$pw5W0lomLcfJUwMxIDsvIuj5eeQ6EjwrocBL2/t46s04H2wzVSYqi', // "password123"
      firstName: 'Freddy',
      lastName: 'Molina',
      roleId: 'role-admin',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Seed contacts
    const contacts: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@techsolutions.cr',
        phone: '+506 8888-8888',
        mobile: '+506 8888-8888',
        jobTitle: 'CEO',
        company: 'Tech Solutions CR',
        leadSource: 'Referral',
        tags: ['VIP', 'Decision Maker'],
        ownerId: 'user-1',
        isActive: true,
      },
      {
        firstName: 'María',
        lastName: 'González',
        email: 'maria.gonzalez@innovationlabs.cr',
        phone: '+506 7777-7777',
        mobile: '+506 7777-7777',
        jobTitle: 'CTO',
        company: 'Innovation Labs',
        leadSource: 'Website',
        tags: ['Technical'],
        ownerId: 'user-1',
        isActive: true,
      },
      {
        firstName: 'Carlos',
        lastName: 'Rodríguez',
        email: 'carlos.rodriguez@globalent.com',
        phone: '+506 6666-6666',
        mobile: '+506 6666-6666',
        jobTitle: 'Sales Director',
        company: 'Global Enterprises',
        leadSource: 'Event',
        tags: ['Hot Lead'],
        ownerId: 'user-1',
        isActive: true,
      },
    ];

    contacts.forEach((c) => this.createContact(c));

    // Seed opportunities
    const opportunities: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Tech Solutions - Q1 2026 Software License',
        amount: 50000,
        currency: 'USD',
        stage: 'Negotiation',
        probability: 80,
        closeDate: '2026-03-31',
        accountName: 'Tech Solutions CR',
        contactName: 'Juan Pérez',
        ownerId: 'user-1',
        isClosed: false,
      },
      {
        name: 'Innovation Labs - Cloud Migration',
        amount: 120000,
        currency: 'USD',
        stage: 'Proposal',
        probability: 60,
        closeDate: '2026-04-15',
        accountName: 'Innovation Labs',
        contactName: 'María González',
        ownerId: 'user-1',
        isClosed: false,
      },
      {
        name: 'Global Enterprises - CRM Implementation',
        amount: 85000,
        currency: 'USD',
        stage: 'Qualification',
        probability: 40,
        closeDate: '2026-05-30',
        accountName: 'Global Enterprises',
        contactName: 'Carlos Rodríguez',
        ownerId: 'user-1',
        isClosed: false,
      },
    ];

    opportunities.forEach((o) => this.createOpportunity(o));

    // Seed activities
    const activities: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        activityType: 'Call',
        subject: 'Follow-up con Juan Pérez',
        description: 'Discutir términos del contrato',
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        status: 'Planned',
        priority: 'High',
        ownerId: 'user-1',
        isCompleted: false,
      },
      {
        activityType: 'Meeting',
        subject: 'Demo de producto para Innovation Labs',
        description: 'Presentación técnica del CRM',
        dueDate: new Date(Date.now() + 172800000).toISOString(),
        status: 'Planned',
        priority: 'High',
        ownerId: 'user-1',
        isCompleted: false,
      },
      {
        activityType: 'Email',
        subject: 'Enviar propuesta a Global Enterprises',
        description: 'Propuesta técnica y económica',
        dueDate: new Date(Date.now() + 259200000).toISOString(),
        status: 'Planned',
        priority: 'Medium',
        ownerId: 'user-1',
        isCompleted: false,
      },
    ];

    activities.forEach((a) => this.createActivity(a));

    console.log('✅ Database seeded with initial data');
    console.log(`📊 Users: ${this.users.size}`);
    console.log(`📊 Contacts: ${this.contacts.size}`);
    console.log(`📊 Opportunities: ${this.opportunities.size}`);
    console.log(`📊 Activities: ${this.activities.size}`);
  }
}

export const db = new Database();
