import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, Car, Settings, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/hooks/useLocalStorage';
import { syncDataWithSupabase, fetchUserData, deleteItem, getCurrentUser } from '@/utils/syncHelpers';
import { Textarea } from '@/components/ui/textarea';

// Interface for a vehicle
interface Vehicle {
  id?: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate: string;
  vin: string;
  registration_number?: string;
  insurance_provider: string;
  insurance_policy_number: string;
  insurance_expiry_date?: string;
  user_id?: string;
}

// Interface for a maintenance record
interface MaintenanceRecord {
  id?: string;
  vehicle_id: string;
  date: string;
  type: string;
  description: string;
  mileage: string;
  cost: string;
  service_provider: string;
  user_id?: string;
}

function Vehicle() {
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Function to toggle sidebar
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  // State for vehicles and maintenance records
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('user-vehicles', []);
  const [maintenanceRecords, setMaintenanceRecords] = useLocalStorage<MaintenanceRecord[]>('user-maintenance-records', []);
  
  // State for adding a new vehicle
  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    make: '',
    model: '',
    year: 0,
    license_plate: '',
    vin: '',
    insurance_provider: '',
    insurance_policy_number: '',
  });
  
  // State for adding a new maintenance record
  const [newMaintenanceRecord, setNewMaintenanceRecord] = useState<Omit<MaintenanceRecord, 'vehicle_id'>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: '',
    description: '',
    mileage: '',
    cost: '',
    service_provider: '',
  });
  
  // State for selected vehicle ID for maintenance records
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  
  // State for toggling between vehicles and maintenance
  const [activeTab, setActiveTab] = useState('vehicles');
  
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        // Get current user
        const user = await getCurrentUser();
        
        if (!user) {
          toast({
            title: "Authentication Error",
            description: "Please sign in to view your vehicles",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Fetch vehicles for the current user
        const vehiclesResult = await fetchUserData<Vehicle>('vehicles', user.id);
        
        if (vehiclesResult.error) {
          console.error('Error fetching vehicles:', vehiclesResult.error);
          toast({
            title: "Error Loading Vehicles",
            description: vehiclesResult.error,
            variant: "destructive",
          });
          // Even on error, clear potentially stale local storage data
          setVehicles([]);
          setMaintenanceRecords([]);
          setSelectedVehicleId(null);
        } else {
          // Fetch was successful, update state with fetched data (even if empty)
          const fetchedVehicles = vehiclesResult.data || [];
          setVehicles(fetchedVehicles);
          
          if (fetchedVehicles.length > 0) {
            // Set selected vehicle only if there are vehicles
            if (!selectedVehicleId || !fetchedVehicles.some(v => v.id === selectedVehicleId)) {
               setSelectedVehicleId(fetchedVehicles[0].id);
            }
            
            // Fetch maintenance records only if vehicles exist
            const recordsResult = await fetchUserData<MaintenanceRecord>('maintenance_records', user.id);
            if (recordsResult.error) {
               console.error('Error fetching maintenance records:', recordsResult.error);
               // Don't toast again, maybe just log
               setMaintenanceRecords([]); // Clear potentially stale records
            } else {
               setMaintenanceRecords(recordsResult.data || []);
            }
          } else {
             // No vehicles fetched, clear related state
             setMaintenanceRecords([]);
             setSelectedVehicleId(null);
          }
        }
      } catch (error) {
        // General catch block, might be redundant if specific errors are handled above
        console.error('Error in fetchData:', error);
        toast({
          title: "Error Loading Data",
          description: error instanceof Error ? error.message : "Failed to load vehicle data",
          variant: "destructive",
        });
        // Clear state on general error too
        setVehicles([]);
        setMaintenanceRecords([]);
        setSelectedVehicleId(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Handler for input changes when adding a new vehicle
  const handleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Convert year to number if the name is 'year'
    if (name === 'year') {
      setNewVehicle(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setNewVehicle(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handler for input changes when adding a new maintenance record
  const handleMaintenanceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMaintenanceRecord(prev => ({ ...prev, [name]: value }));
  };

  // Handler for adding a new vehicle
  const handleAddVehicle = async () => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to add a vehicle",
        variant: "destructive",
      });
      return;
    }

    // Basic validation (optional but good)
    if (!newVehicle.make || !newVehicle.model || !newVehicle.year || !newVehicle.license_plate || !newVehicle.vin) {
        toast({
            title: "Missing Information",
            description: "Please fill out all required vehicle fields.",
            variant: "destructive",
        });
        return;
    }

    setIsLoading(true);
    
    try {
      const newId = uuidv4(); // Generate NEW ID
      
      const vehicleToInsert = {
          id: newId, // Use the newly generated ID
          user_id: userId,
          make: newVehicle.make,
          model: newVehicle.model,
          year: newVehicle.year,
          color: newVehicle.color || null, 
          license_plate: newVehicle.license_plate,
          vin: newVehicle.vin,
          registration_number: newVehicle.registration_number || null,
          insurance_provider: newVehicle.insurance_provider,
          insurance_policy_number: newVehicle.insurance_policy_number,
          insurance_expiry_date: newVehicle.insurance_expiry_date || null
      };

      console.log("handleAddVehicle: Attempting DIRECT insert:", vehicleToInsert); // Debug log
      
      // --- Direct Supabase Insert Call --- 
      const { data: insertedData, error: insertError } = await supabase
        .from('vehicles')
        .insert(vehicleToInsert)
        .select(); // select() is useful to get the inserted data back
      // --- End Direct Call --- 

      console.log("handleAddVehicle: Direct insert result - Error:", insertError);
      console.log("handleAddVehicle: Direct insert result - Data:", insertedData);

      if (insertError) {
          // If the direct call fails, log the specific error
          console.error('Direct Supabase insert failed:', insertError);
          throw insertError; // Throw the actual Supabase error
      }
      
      // Add to local state only AFTER successful insert
      if (insertedData && insertedData.length > 0) {
        setVehicles(prev => [...prev, insertedData[0]]); // Add the actual inserted data
      } else {
          // Should not happen if error is null, but good to handle
          console.warn("Supabase insert returned no error but no data?");
          setVehicles(prev => [...prev, vehicleToInsert]); // Fallback to using original object
      }

      // Clear the form state COMPLETELY
      setNewVehicle({
        id: undefined, user_id: '', make: '', model: '', year: 0,
        color: '', license_plate: '', vin: '', registration_number: '',
        insurance_provider: '', insurance_policy_number: '', insurance_expiry_date: ''
      });
      
      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been added successfully",
      });
      
      if (!selectedVehicleId) {
        setSelectedVehicleId(newId);
      }
    } catch (error) {
      console.error('Error adding vehicle:', error); 
      toast({
        title: "Error Adding Vehicle",
        description: error instanceof Error ? error.message : "Failed to add vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for adding a new maintenance record
  const handleAddMaintenanceRecord = async () => {
    if (!selectedVehicleId) {
      toast({
        title: "No Vehicle Selected",
        description: "Please select a vehicle to add a maintenance record",
        variant: "destructive",
      });
      return;
    }
    
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to add a maintenance record",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const recordId = uuidv4();
      const recordWithIds = { 
        ...newMaintenanceRecord, 
        id: recordId,
        vehicle_id: selectedVehicleId,
        user_id: userId
      };
      
      // Add to local state first for immediate UI update
      setMaintenanceRecords(prev => [...prev, recordWithIds]);
      
      // Then sync with Supabase
      const result = await syncDataWithSupabase('maintenance_records', [recordWithIds], userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Clear the form
      setNewMaintenanceRecord({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: '',
        description: '',
        mileage: '',
        cost: '',
        service_provider: '',
      });
      
      toast({
        title: "Maintenance Record Added",
        description: "Your maintenance record has been added successfully",
      });
    } catch (error) {
      console.error('Error adding maintenance record:', error);
      toast({
        title: "Error Adding Maintenance Record",
        description: error instanceof Error ? error.message : "Failed to add maintenance record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for deleting a vehicle
  const handleDeleteVehicle = async (id: string) => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to delete a vehicle",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Delete from Supabase first
      const result = await deleteItem('vehicles', id, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Then update local state
      setVehicles(prev => prev.filter(vehicle => vehicle.id !== id));
      
      // Also delete associated maintenance records
      const relatedRecords = maintenanceRecords.filter(record => record.vehicle_id === id);
      
      for (const record of relatedRecords) {
        if (record.id) {
          await deleteItem('maintenance_records', record.id, userId);
        }
      }
      
      setMaintenanceRecords(prev => prev.filter(record => record.vehicle_id !== id));
      
      // Update selected vehicle ID if the deleted vehicle was selected
      if (selectedVehicleId === id) {
        const remainingVehicles = vehicles.filter(vehicle => vehicle.id !== id);
        setSelectedVehicleId(remainingVehicles.length > 0 ? remainingVehicles[0].id : null);
      }
      
      toast({
        title: "Vehicle Deleted",
        description: "Your vehicle and its maintenance records have been deleted",
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: "Error Deleting Vehicle",
        description: error instanceof Error ? error.message : "Failed to delete vehicle",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for deleting a maintenance record
  const handleDeleteMaintenanceRecord = async (id: string) => {
    if (!userId) {
      toast({
        title: "Authentication Error",
        description: "Please sign in to delete a maintenance record",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Delete from Supabase first
      const result = await deleteItem('maintenance_records', id, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Then update local state
      setMaintenanceRecords(prev => prev.filter(record => record.id !== id));
      
      toast({
        title: "Maintenance Record Deleted",
        description: "Your maintenance record has been deleted",
      });
    } catch (error) {
      console.error('Error deleting maintenance record:', error);
      toast({
        title: "Error Deleting Maintenance Record",
        description: error instanceof Error ? error.message : "Failed to delete maintenance record",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get a vehicle by ID
  const getVehicleById = (id: string): Vehicle | undefined => {
    return vehicles.find(vehicle => vehicle.id === id);
  };

  // Handler for changing the selected vehicle
  const handleVehicleChange = (id: string) => {
    setSelectedVehicleId(id);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Vehicle Information</h1>
          
          <Tabs defaultValue="vehicles" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="vehicles" className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicles
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Maintenance Records
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="vehicles">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Existing vehicles */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Your Vehicles</h2>
                  
                  {vehicles.length === 0 ? (
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-center p-6 text-gray-500">
                          <div className="text-center">
                            <Car className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p>No vehicles added yet</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {vehicles.map((vehicle) => (
                        <Card 
                          key={vehicle.id} 
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedVehicleId === vehicle.id ? 'border-primary' : ''
                          }`}
                          onClick={() => vehicle.id && handleVehicleChange(vehicle.id)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle>
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </CardTitle>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  vehicle.id && handleDeleteVehicle(vehicle.id);
                                }}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                            <CardDescription>
                              {vehicle.license_plate && (
                                <Badge className="mr-2">
                                  License: {vehicle.license_plate}
                                </Badge>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <p className="font-medium">VIN:</p>
                                <p>{vehicle.vin || 'Not provided'}</p>
                              </div>
                              <div>
                                <p className="font-medium">Insurance:</p>
                                <p>{vehicle.insurance_provider || 'Not provided'}</p>
                              </div>
                              {vehicle.insurance_policy_number && (
                                <div className="col-span-2">
                                  <p className="font-medium">Policy #:</p>
                                  <p>{vehicle.insurance_policy_number}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Add new vehicle */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Add New Vehicle</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle>Vehicle Details</CardTitle>
                      <CardDescription>
                        Enter the details of your vehicle below
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="make">Make</Label>
                          <Input 
                            id="make" 
                            name="make"
                            placeholder="e.g. Toyota" 
                            value={newVehicle.make}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="model">Model</Label>
                          <Input 
                            id="model" 
                            name="model"
                            placeholder="e.g. Camry" 
                            value={newVehicle.model}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="year">Year</Label>
                          <Input 
                            id="year" 
                            name="year"
                            placeholder="e.g. 2020" 
                            value={newVehicle.year}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="license_plate">License Plate</Label>
                          <Input 
                            id="license_plate" 
                            name="license_plate"
                            placeholder="e.g. ABC123" 
                            value={newVehicle.license_plate}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label htmlFor="vin">VIN</Label>
                          <Input 
                            id="vin" 
                            name="vin"
                            placeholder="Vehicle Identification Number" 
                            value={newVehicle.vin}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insurance_provider">Insurance Provider</Label>
                          <Input 
                            id="insurance_provider" 
                            name="insurance_provider"
                            placeholder="e.g. State Farm" 
                            value={newVehicle.insurance_provider}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insurance_policy_number">Policy Number</Label>
                          <Input 
                            id="insurance_policy_number" 
                            name="insurance_policy_number"
                            placeholder="e.g. POL123456" 
                            value={newVehicle.insurance_policy_number}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={handleAddVehicle}
                        disabled={isLoading || !newVehicle.make || !newVehicle.model}
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Vehicle
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Existing maintenance records */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Maintenance Records</h2>
                    
                    {vehicles.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor="vehicleSelect">For:</Label>
                        <select 
                          id="vehicleSelect"
                          className="p-2 border rounded"
                          value={selectedVehicleId || ''}
                          onChange={(e) => setSelectedVehicleId(e.target.value)}
                        >
                          {vehicles.map((vehicle) => (
                            <option key={vehicle.id} value={vehicle.id}>
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {/* Alert if no vehicle is selected */}
                  {vehicles.length === 0 ? (
                    <Card className="mb-4">
                      <CardContent className="pt-6">
                        <div className="flex items-center p-4 text-amber-800 bg-amber-50 rounded-lg">
                          <AlertCircle className="w-5 h-5 mr-2" />
                          <div>
                            <p className="font-medium">No vehicles found</p>
                            <p className="text-sm">Please add a vehicle first</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Maintenance records for selected vehicle */}
                      {maintenanceRecords.filter(record => record.vehicle_id === selectedVehicleId).length === 0 ? (
                        <Card className="mb-4">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-center p-6 text-gray-500">
                              <div className="text-center">
                                <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p>No maintenance records for this vehicle</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="space-y-4">
                          {maintenanceRecords
                            .filter(record => record.vehicle_id === selectedVehicleId)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((record) => (
                              <Card key={record.id}>
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between items-start">
                                    <CardTitle className="text-base">
                                      {record.type}
                                    </CardTitle>
                                    <Button 
                                      variant="ghost" 
                                      size="icon"
                                      onClick={() => record.id && handleDeleteMaintenanceRecord(record.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </div>
                                  <CardDescription>
                                    <Badge variant="outline" className="mr-2">
                                      {record.date}
                                    </Badge>
                                    {record.mileage && (
                                      <Badge variant="secondary">
                                        {record.mileage} miles
                                      </Badge>
                                    )}
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2 text-sm">
                                    <p>{record.description}</p>
                                    
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                      <div>
                                        <p className="font-medium">Provider:</p>
                                        <p>{record.service_provider || 'Not provided'}</p>
                                      </div>
                                      <div>
                                        <p className="font-medium">Cost:</p>
                                        <p>{record.cost ? `$${record.cost}` : 'Not provided'}</p>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          }
                        </div>
                      )}
                    </>
                  )}
                </div>
                
                {/* Add new maintenance record */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Add Maintenance Record</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle>Maintenance Details</CardTitle>
                      <CardDescription>
                        {selectedVehicleId && getVehicleById(selectedVehicleId) ? (
                          <span>
                            For: {getVehicleById(selectedVehicleId)?.year} {getVehicleById(selectedVehicleId)?.make} {getVehicleById(selectedVehicleId)?.model}
                          </span>
                        ) : (
                          <span>Please select a vehicle first</span>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Date</Label>
                          <Input 
                            id="date" 
                            name="date"
                            type="date" 
                            value={newMaintenanceRecord.date}
                            onChange={handleMaintenanceInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Type</Label>
                          <Input 
                            id="type" 
                            name="type"
                            placeholder="e.g. Oil Change" 
                            value={newMaintenanceRecord.type}
                            onChange={handleMaintenanceInputChange}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="description">Description</Label>
                          <Input 
                            id="description" 
                            name="description"
                            placeholder="Details about the maintenance" 
                            value={newMaintenanceRecord.description}
                            onChange={handleMaintenanceInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="mileage">Mileage</Label>
                          <Input 
                            id="mileage" 
                            name="mileage"
                            placeholder="e.g. 50000" 
                            value={newMaintenanceRecord.mileage}
                            onChange={handleMaintenanceInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cost">Cost ($)</Label>
                          <Input 
                            id="cost" 
                            name="cost"
                            placeholder="e.g. 75.50" 
                            value={newMaintenanceRecord.cost}
                            onChange={handleMaintenanceInputChange}
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor="service_provider">Service Provider</Label>
                          <Input 
                            id="service_provider" 
                            name="service_provider"
                            placeholder="e.g. Jiffy Lube" 
                            value={newMaintenanceRecord.service_provider}
                            onChange={handleMaintenanceInputChange}
                          />
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={handleAddMaintenanceRecord}
                        disabled={
                          isLoading || 
                          !selectedVehicleId || 
                          !newMaintenanceRecord.type || 
                          !newMaintenanceRecord.date
                        }
                      >
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Maintenance Record
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

export default Vehicle; 