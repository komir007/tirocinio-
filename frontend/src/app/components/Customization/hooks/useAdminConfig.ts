import { useEffect, useState, useContext } from 'react';
import { FormCustomization } from '../types/customization.types';
import { AuthContext } from '../../Authcontext';
import { useServerCustomization } from './useServerCustomization';

interface UseAdminConfigReturn {
  adminConfig: FormCustomization | null;
  loading: boolean;
  error: string | null;
  createdBy: string | null;
}

/**
 * Hook per recuperare la configurazione admin per utenti non-admin
 * Fa la chiamata API solo se l'utente non è admin
 */
export function useAdminConfig(formId: string): UseAdminConfigReturn {
  const authContext = useContext(AuthContext);
  const isAdmin = authContext?.user?.role === 'admin';
  const { getAdminFieldRestrictions } = useServerCustomization();
  
  const [adminConfig, setAdminConfig] = useState<FormCustomization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdBy, setCreatedBy] = useState<string | null>(null);

  useEffect(() => {
    // Se l'utente è admin, non caricare configurazioni admin
    if (isAdmin) {
      console.log('👑 User is admin - skipping admin config fetch');
      setAdminConfig(null);
      setLoading(false);
      return;
    }

    // Solo per utenti non-admin, carica la configurazione admin
    const fetchAdminConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔍 Non-admin user - fetching admin config for form:', formId);
        
        const config = await getAdminFieldRestrictions(formId);
        
        if (config) {
          console.log('✅ Admin config loaded successfully:', config);
          setAdminConfig(config.adminFieldRestrictions || config);
          setCreatedBy(config.createdBy || null);
        } else {
          console.log('ℹ️ No admin config found for form:', formId);
          setAdminConfig(null);
        }
      } catch (err) {
        console.error('❌ Error fetching admin config:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch admin config');
        setAdminConfig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminConfig();
  }, [formId, isAdmin, getAdminFieldRestrictions]);

  return {
    adminConfig,
    loading,
    error,
    createdBy
  };
}
