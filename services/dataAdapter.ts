
import { Member, MembershipRate, MemberCategory } from '../types';

export const DataAdapter = {
  /**
   * Maps a database member object to the UI Member interface.
   */
  dbToMember(dbMember: any): Member {
    return {
      id: dbMember.id,
      numero_socio: dbMember.member_number,
      nombre: dbMember.first_name,
      apellido: dbMember.last_name,
      dni: dbMember.dni,
      telefono: dbMember.phone || '',
      direccion: dbMember.address || '',
      categoria: dbMember.category === 'family_group' ? 'grupo_familiar' : 'general',
      created_at: dbMember.created_at
    };
  },

  /**
   * Maps a UI Member object to the database member format.
   */
  memberToDb(member: Member): any {
    return {
      member_number: member.numero_socio,
      first_name: member.nombre,
      last_name: member.apellido,
      dni: member.dni,
      phone: member.telefono,
      address: member.direccion,
      category: member.categoria === 'grupo_familiar' ? 'family_group' : 'general'
    };
  },

  /**
   * Maps a database membership rate to the UI MembershipRate interface.
   */
  dbToMembershipRate(dbRate: any): MembershipRate {
    return {
      id: dbRate.id,
      año: dbRate.year,
      mes: dbRate.month,
      categoria: dbRate.category === 'family_group' ? 'grupo_familiar' : 'general',
      valor: Number(dbRate.amount)
    };
  }
};
