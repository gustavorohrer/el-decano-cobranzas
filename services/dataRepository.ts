
import { MembersDao } from './membersDao';
import { supabase } from './supabase';
import { 
  AppState, Member, MemberPayment, AccountingMovement, 
  MembershipRate, AdvertisingPanel, AdvertisingContract, 
  AdvertisingRate, ClubConfig, Collector, User 
} from '../types';

/**
 * DataRepository
 * 
 * Acting as a Single Source of Truth, this repository abstracts the data source.
 * Following the User's direction, we prioritize Supabase (Cloud) over LocalStorage.
 */
export const DataRepository = {
  /**
   * Fetches the complete application state from the cloud.
   */
  async getInitialState(year: number): Promise<Partial<AppState>> {
    try {
      const [
        members, 
        membershipRates,
        panels,
        advertisingRates,
        clubConfig,
        // For now, we fetch others using generic supabase calls while DAOs are being built
        payments,
        movements,
        advertisingContracts
      ] = await Promise.all([
        MembersDao.getMembers(),
        MembersDao.getMembershipRates(year),
        this.getPanels(),
        this.getAdvertisingRates(year),
        this.getClubConfig(),
        this.getPayments(),
        this.getMovements(),
        this.getAdvertisingContracts()
      ]);

      return {
        members,
        membershipRates,
        panels,
        advertisingRates,
        clubConfig,
        payments,
        movements,
        advertisingContracts
      };
    } catch (error) {
      console.error('Error fetching initial state from repository:', error);
      return {};
    }
  },

  // --- Helper methods (will be moved to specific DAOs later) ---

  async getPanels(): Promise<AdvertisingPanel[]> {
    const { data } = await supabase.from('advertising_panels').select('*').order('panel_number');
    return (data || []) as AdvertisingPanel[];
  },

  async getAdvertisingRates(year: number): Promise<AdvertisingRate[]> {
    const { data } = await supabase.from('advertising_rates').select('*').eq('year', year);
    return (data || []) as AdvertisingRate[];
  },

  async getClubConfig(): Promise<ClubConfig> {
    const { data: config } = await supabase.from('club_config').select('*').eq('id', 1).single();
    const { data: collectors } = await supabase.from('collectors').select('*');
    
    return {
      president: {
        full_name: config?.president_full_name || '',
        dni: config?.president_dni || '',
        civil_status: config?.president_civil_status || '',
        address: config?.president_address || ''
      },
      collectors: (collectors || []) as Collector[]
    };
  },

  async getPayments(): Promise<MemberPayment[]> {
    const { data } = await supabase.from('member_payments').select('*');
    return (data || []) as MemberPayment[];
  },

  async getMovements(): Promise<AccountingMovement[]> {
    const { data } = await supabase.from('accounting_movements').select('*').order('date', { ascending: false });
    return (data || []) as AccountingMovement[];
  },

  async getAdvertisingContracts(): Promise<AdvertisingContract[]> {
    const { data } = await supabase.from('advertising_contracts').select('*');
    return (data || []) as AdvertisingContract[];
  },

  /**
   * Bulk inserts members into Supabase.
   */
  async bulkCreateMembers(members: Member[]): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from('members').insert(members);
    
    if (error) {
      console.error('Error in bulkCreateMembers:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  /**
   * Creates a single member in Supabase.
   */
  async createMember(member: Member): Promise<{ success: boolean; error?: string }> {
    const { error } = await supabase.from('members').insert(member);
    
    if (error) {
      console.error('Error in createMember:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  }
};
