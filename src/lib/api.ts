import { supabase } from './supabase';
import type { Company, Location, Circuit } from '../types';

interface CompanyFilters {
  search?: string;
  state?: string;
  city?: string;
}

// Companies
export async function getCompanies(filters?: CompanyFilters) {
  let query = supabase
    .from('companies')
    .select(`
      id,
      name,
      street_address,
      address_city,
      address_state,
      address_zip,
      address_country,
      phone,
      email,
      website,
      created_at,
      updated_at
    `);

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,` +
      `address_city.ilike.%${filters.search}%,` +
      `address_state.ilike.%${filters.search}%`
    );
  }
  
  if (filters?.state) {
    query = query.eq('address_state', filters.state);
  }
  
  if (filters?.city) {
    query = query.eq('address_city', filters.city);
  }

  const { data, error } = await query
    .order('name', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getCompany(id: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createCompany(company: CompanyFormData) {
  const { data, error } = await supabase
    .from('companies')
    .insert([company])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCompanyDependencies(id: string) {
  const { data: locations, error } = await supabase
    .from('locations')
    .select('id, name')
    .eq('company_id', id);
  
  if (error) throw error;
  return locations;
}

export async function deleteCompany(id: string) {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteLocation(id: string) {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function deleteCircuit(id: string) {
  const { error } = await supabase
    .from('circuits')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function updateCompany(id: string, company: Omit<Company, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('companies')
    .update({
      ...company,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateLocation(id: string, location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) {
  // First get the current location to check if company is changing
  const { data: currentLocation } = await supabase
    .from('locations')
    .select(`
      company_id,
      company:companies(name)
    `)
    .eq('id', id)
    .single();

  if (currentLocation && currentLocation.company_id !== location.company_id) {
    // Get affected proposals
    const { data: proposalLocations } = await supabase
      .from('proposal_locations')
      .select('proposal_id')
      .eq('location_id', id);

    let affectedProposals = [];
    if (proposalLocations?.length) {
      const { data: proposals } = await supabase
        .from('proposals')
        .select(`
          id,
          name,
          company:companies(name)
        `)
        .eq('company_id', currentLocation.company_id)
        .in('id', proposalLocations.map(pl => pl.proposal_id));

      if (proposals) {
        affectedProposals = proposals;
      }
    }

    if (affectedProposals?.length > 0) {
      // Remove location from affected proposals
      await supabase
        .from('proposal_locations')
        .delete()
        .eq('location_id', id);

      // Also remove any associated circuits from proposals
      await supabase
        .from('proposal_circuits')
        .delete()
        .eq('location_id', id);

      // Return both the updated location and affected proposals
      const { data: updatedLocation, error } = await supabase
        .from('locations')
        .update({
          ...location,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        location: updatedLocation,
        affectedProposals
      };
    }
  }

  const { data, error } = await supabase
    .from('locations')
    .update({
      ...location,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

interface LocationFilters {
  search?: string;
  state?: string;
  city?: string;
  criticality?: string;
  company_id?: string;
}

// Locations
export async function getLocations(filters?: LocationFilters) {
  let query = supabase
    .from('locations')
    .select(`
      *,
      company:companies!company_id(
        id, 
        name
      )
    `);

  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,` +
      `address.ilike.%${filters.search}%,` +
      `address_city.ilike.%${filters.search}%,` +
      `address_state.ilike.%${filters.search}%`
    );
  }
  
  if (filters?.state) {
    query = query.eq('address_state', filters.state);
  }
  
  if (filters?.city) {
    query = query.eq('address_city', filters.city);
  }
  
  if (filters?.criticality) {
    query = query.eq('criticality', filters.criticality);
  }
  
  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id);
  }

  const { data, error } = await query
    .order('name', { ascending: true })
    .throwOnError();
  
  if (error) throw error;
  return data;
}

export async function getLocation(id: string) {
  const { data, error } = await supabase
    .from('locations')
    .select(`
      *,
      company:companies!company_id(
        id,
        name
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('locations')
    .insert([location])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

interface CircuitFilters {
  search?: string;
  carrier?: string;
  type?: string;
  status?: string;
  location_id?: string;
}

// Circuits
export async function getCircuits(filters?: CircuitFilters) {
  let query = supabase
    .from('circuits')
    .select(`
      id,
      carrier,
      type,
      purpose,
      status,
      bandwidth,
      monthlycost,
      static_ips,
      upload_bandwidth,
      contract_start_date,
      contract_term,
      contract_end_date,
      billing,
      usage_charges,
      installation_cost,
      notes,
      location_id,
      location:locations!inner(
        id,
        name,
        company:companies!inner(
          id,
          name
        )
      )
    `);

  if (filters?.search) {
    query = query.or(
      `carrier.ilike.%${filters.search}%,` +
      `type.ilike.%${filters.search}%,` +
      `bandwidth.ilike.%${filters.search}%`
    );
  }
  
  if (filters?.carrier) {
    query = query.eq('carrier', filters.carrier);
  }
  
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.location_id) {
    query = query.eq('location_id', filters.location_id);
  }

  const { data, error } = await query.order('carrier');
  
  if (error) throw error;
  return data;
}

export async function getCircuit(id: string) {
  const { data, error } = await supabase
    .from('circuits')
    .select(`
      id,
      carrier,
      type,
      purpose,
      status,
      bandwidth,
      monthlycost,
      static_ips,
      upload_bandwidth,
      contract_start_date,
      contract_term,
      contract_end_date,
      billing,
      usage_charges,
      installation_cost,
      notes,
      location_id,
      location:locations!inner(
        id,
        name,
        company:companies!inner(
          id,
          name
        )
      )
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

// Create circuit
export async function createCircuit(circuit: Omit<Circuit, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('circuits')
    .insert([circuit])
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateCircuit(id: string, circuit: Omit<Circuit, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('circuits')
    .update({
      ...circuit,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateUserProfile(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('No authenticated user');

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) throw error;
  return profile;
}

// Dashboard Stats
interface DashboardFilters {
  company_id?: string;
  location_id?: string;
}

export async function getDashboardStats(filters?: DashboardFilters) {
  let query = supabase
    .from('circuits')
    .select(`
      status,
      monthlycost,
      location:locations!inner (
        id,
        company_id
      )
    `);

  if (filters?.location_id) {
    query = query.eq('location_id', filters.location_id);
  }

  if (filters?.company_id) {
    query = query.eq('location.company_id', filters.company_id);
  }

  const { data: circuits, error } = await query;
  
  if (error) throw error;

  const totalCircuits = circuits.length;
  const activeCircuits = circuits.filter(c => c.status === 'Active').length;
  const inactiveCircuits = circuits.filter(c => c.status === 'Inactive').length;
  const totalMonthlyCost = circuits.reduce((sum, c) => sum + (c.monthlycost || 0), 0);

  return {
    totalCircuits,
    activeCircuits,
    inactiveCircuits,
    totalMonthlyCost
  };
}

export async function getCurrentUserProfile() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!user) throw new Error('No authenticated user');

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }

  if (!data) {
    // Create profile for new user
    const { data: newProfile, error: createError } = await supabase
      .from('user_profiles')
      .insert([{ user_id: user.id, role: 'viewer' }])
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating user profile:', createError);
      throw new Error('Failed to create user profile');
    }
    
    return newProfile;
  }

  return data;
}

// Get all user profiles (admin-only)
export async function getUserProfiles() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      user:auth.users!user_id(
        email,
        last_sign_in_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Update user role (admin-only)
export async function updateUserRole(userId: string, role: 'admin' | 'viewer') {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ role })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getEnvironmentVariable(key: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .rpc('get_environment_variable', { var_key: key })
      .single()
      .throwOnError();
    
    if (error) throw error;
    return data?.value || null;
  } catch (error) {
    console.error(`Error fetching environment variable ${key}:`, error);
    return null;
  }
}

// Proposals
export async function getProposals(companyId?: string) {
  let query = supabase
    .from('proposals')
    .select(`
      *,
      company:companies(name)
    `);

  if (companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data: proposals, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  
  // Get full proposal data for each proposal
  const fullProposals = await Promise.all(
    proposals.map(async (proposal) => {
      const { data: proposalData } = await supabase
        .from('proposals')
        .select(`
          *,
          company:companies(name),
          locations:proposal_locations(
            location:locations(
              id,
              name,
              city,
              state,
              criticality
            )
          )
        `)
        .eq('id', proposal.id)
        .single();

      return {
        ...proposalData,
        locations: proposalData?.locations?.map((pl: any) => pl.location) || []
      };
    })
  );

  return fullProposals;
}

export async function getProposal(id: string) {
  const { data, error } = await supabase
    .from('proposals')
    .select(`
      *,
      company:companies(name),
      locations:proposal_locations(
        location:locations(*)
      ),
      circuits:proposal_circuits(
        *,
        circuit:circuits(*),
        location:locations(*)
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return {
    ...data,
    locations: data.locations?.map((pl: any) => pl.location) || [],
    circuits: data.circuits || []
  };
}

export async function createProposal(proposal: {
  name: string;
  company_id: string;
  locations: string[];
  status?: string;
  valid_until?: string;
  notes?: string;
}) {
  // Verify all locations belong to the company
  const { data: locationCompanies } = await supabase
    .from('locations')
    .select('company_id')
    .in('id', proposal.locations);

  const invalidLocations = locationCompanies?.some(
    loc => loc.company_id !== proposal.company_id
  );

  if (invalidLocations) {
    throw new Error('All locations must belong to the selected company');
  }

  // First create the proposal
  const { data: proposalData, error: proposalError } = await supabase
    .from('proposals')
    .insert([{
      name: proposal.name,
      company_id: proposal.company_id,
      status: proposal.status || 'Draft',
      valid_until: proposal.valid_until,
      notes: proposal.notes
    }])
    .select()
    .single();
  
  if (proposalError) throw proposalError;

  if (proposal.locations.length > 0) {
    // Create location associations
    const { error: locationsError } = await supabase
      .from('proposal_locations')
      .insert(
        proposal.locations.map(locationId => ({
          proposal_id: proposalData.id,
          location_id: locationId
        }))
      );
    
    if (locationsError) throw locationsError;
  }

  // Return full proposal data including locations
  const { data: fullProposal, error: getError } = await supabase
    .from('proposals')
    .select(`
      *,
      company:companies(name),
      locations:proposal_locations(
        location:locations(
          id,
          name,
          city,
          state,
          criticality
        )
      )
    `)
    .eq('id', proposalData.id)
    .single();

  if (getError) throw getError;
  return {
    ...fullProposal,
    locations: fullProposal.locations?.map((pl: any) => pl.location) || []
  };
}

export async function updateProposal(
  id: string,
  proposal: {
    name?: string;
    company_id?: string;
    locations?: string[];
    status?: string;
    valid_until?: string;
    notes?: string;
  }
) {
  // First update the proposal
  const { data, error } = await supabase
    .from('proposals')
    .update({
      name: proposal.name,
      company_id: proposal.company_id,
      status: proposal.status,
      valid_until: proposal.valid_until || null,
      notes: proposal.notes,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;

  // Then update location associations if provided
  if (Array.isArray(proposal.locations)) {
    // Get current locations
    const { data: currentLocations } = await supabase
      .from('proposal_locations')
      .select('location_id')
      .eq('proposal_id', id);

    const removedLocations = currentLocations
      ?.filter(cl => !proposal.locations.includes(cl.location_id))
      .map(cl => cl.location_id) || [];

    // First delete existing associations
    await supabase
      .from('proposal_locations')
      .delete()
      .eq('proposal_id', id);

    // Remove circuits for removed locations
    if (removedLocations.length > 0) {
      await supabase
        .from('proposal_circuits')
        .delete()
        .eq('proposal_id', id)
        .in('location_id', removedLocations);
    }

    // Then create new ones
    if (proposal.locations.length > 0) {
      const { error: insertError } = await supabase
        .from('proposal_locations')
        .insert(
          proposal.locations.map(locationId => ({
            proposal_id: id,
            location_id: locationId
          }))
        );
      
      if (insertError) throw insertError;
    }
  }


  // Get the updated proposal with all its relations
  const { data: fullProposal, error: getError } = await supabase
    .from('proposals')
    .select(`
      *,
      company:companies(name),
      locations:proposal_locations(
        location:locations(
          id,
          name,
          city,
          state,
          criticality
        )
      )
    `)
    .eq('id', id)
    .single();

  if (getError) throw getError;
  return {
    ...fullProposal,
    locations: fullProposal.locations?.map((pl: any) => pl.location) || []
  };
}

export async function deleteProposal(id: string) {
  const { error } = await supabase
    .from('proposals')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Proposal Circuits
export async function addProposalCircuit(circuit: {
  proposal_id: string;
  circuit_id: string;
  location_id: string;
}) {
  const { data, error } = await supabase
    .from('proposal_circuits')
    .insert([circuit])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProposalCircuit(
  id: string,
  circuit: Partial<{
    proposal_id: string;
    circuit_id: string;
    location_id: string;
  }>
) {
  const { data, error } = await supabase
    .from('proposal_circuits')
    .update(circuit)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProposalCircuit(id: string) {
  const { error } = await supabase
    .from('proposal_circuits')
    .delete()
    .eq('id', id);

  if (error) throw error;
}