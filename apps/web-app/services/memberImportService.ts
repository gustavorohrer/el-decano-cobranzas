
import * as XLSX from 'xlsx';
import { Member, MemberCategory } from '../types';

export interface ImportValidationResult {
  row: number;
  data: Partial<Member>;
  errors: string[];
  warnings: string[];
  status: 'valid' | 'warning' | 'error';
}

export const MemberImportService = {
  /**
   * Generates and downloads a sample Excel template for member import.
   */
  downloadTemplate() {
    const templateData = [
      {
        'Número de Socio': '1001',
        'Nombre': 'Juan',
        'Apellido': 'Pérez',
        'DNI': '20111222',
        'Teléfono': '3456111222',
        'Dirección': 'Av. Belgrano 123',
        'Categoría': 'General'
      },
      {
        'Número de Socio': '1002',
        'Nombre': 'María',
        'Apellido': 'García',
        'DNI': '25333444',
        'Teléfono': '3456333444',
        'Dirección': 'Urquiza 456',
        'Categoría': 'Grupo Familiar'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Plantilla_Importacion_Socios.xlsx");
  },

  /**
   * Parses an Excel file and validates its content.
   */
  async parseAndValidate(file: File, existingMembers: Member[]): Promise<ImportValidationResult[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const results: ImportValidationResult[] = jsonData.map((row: any, index) => {
            const errors: string[] = [];
            const warnings: string[] = [];
            
            const memberNumber = String(row['Número de Socio'] || '').trim();
            const firstName = String(row['Nombre'] || '').trim();
            const lastName = String(row['Apellido'] || '').trim();
            const dni = String(row['DNI'] || '').trim();
            const categoryInput = String(row['Categoría'] || '').toLowerCase();
            
            // Validation: Member Number
            if (!memberNumber) {
              errors.push('El número de socio es obligatorio.');
            } else if (existingMembers.some(m => m.member_number === memberNumber)) {
              errors.push(`El número de socio ${memberNumber} ya existe en la base de datos.`);
            }

            // Validation: Names
            if (!firstName) errors.push('El nombre es obligatorio.');
            if (!lastName) errors.push('El apellido es obligatorio.');

            // Validation: DNI
            if (!dni) {
              warnings.push('DNI no proporcionado.');
            } else if (existingMembers.some(m => m.dni === dni)) {
              errors.push(`El DNI ${dni} ya existe en la base de datos.`);
            }

            // Validation: Category
            let category: MemberCategory = 'general';
            if (categoryInput.includes('familiar')) {
              category = 'family_group';
            } else if (categoryInput.includes('general') || !categoryInput) {
              category = 'general';
            } else {
              warnings.push(`Categoría "${row['Categoría']}" no reconocida. Se asignó "General".`);
            }

            const status = errors.length > 0 ? 'error' : (warnings.length > 0 ? 'warning' : 'valid');

            return {
              row: index + 2, // Excel row numbering
              data: {
                member_number: memberNumber,
                first_name: firstName,
                last_name: lastName,
                dni: dni,
                phone: String(row['Teléfono'] || '').trim(),
                address: String(row['Dirección'] || '').trim(),
                category,
                created_at: new Date().toISOString()
              },
              errors,
              warnings,
              status
            };
          });

          // Check for duplicates within the Excel itself
          results.forEach((res, i) => {
            if (res.status === 'error') return;
            
            const internalNumDup = results.some((other, j) => i !== j && other.data.member_number === res.data.member_number);
            if (internalNumDup) {
              res.errors.push(`Número de socio duplicado dentro del archivo.`);
              res.status = 'error';
            }

            const internalDniDup = res.data.dni && results.some((other, j) => i !== j && other.data.dni === res.data.dni);
            if (internalDniDup) {
              res.errors.push(`DNI duplicado dentro del archivo.`);
              res.status = 'error';
            }
          });

          resolve(results);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
};
