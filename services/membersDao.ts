
import { supabase } from './supabase';
import { Member, MembershipRate } from '../types';

export const MembersDao = {
  /**
   * Fetches all members from Supabase.
   */
  async getMembers(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) {
      console.error('Error fetching members:', error);
      return [];
    }

    return (data || []) as Member[];
  },

  /**
   * Fetches membership rates for a specific year.
   */
  async getMembershipRates(year: number): Promise<MembershipRate[]> {
    const { data, error } = await supabase
      .from('membership_rates')
      .select('*')
      .eq('year', year)
      .order('month', { ascending: true });

    if (error) {
      console.error('Error fetching membership rates:', error);
      return [];
    }

    return (data || []) as MembershipRate[];
  }
};
