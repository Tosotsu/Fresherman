import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, Car, Settings, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import useLocalStorage from '@/hooks/useLocalStorage';
import { syncDataWithSupabase, fetchUserData, deleteItem, getCurrentUser } from '@/utils/syncHelpers';

// Interface for a vehicle
interface Vehicle {
  id?: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  vin: string;
  insuranceProvider: string;
  insurancePolicy: string;
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
  provider: string;
  user_id?: string;
}

function Vehicle() {
  const { toast } = useToast();
  
  // State for vehicles and maintenance records
  const [vehicles, setVehicles] = useLocalStorage<Vehicle[]>('user-vehicles', []);
  const [maintenanceRecords, setMaintenanceRecords] = useLocalStorage<MaintenanceRecord[]>('user-maintenance-records', []);
  
  // State for adding a new vehicle
  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    make: '',
    model: '',
    year: '',
    licensePlate: '',
    vin: '',
    insuranceProvider: '',
    insurancePolicy: '',
  });
  
  // State for adding a new maintenance record
  const [newMaintenanceRecord, setNewMaintenanceRecord] = useState<Omit<MaintenanceRecord, 'vehicle_id'>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: '',
    description: '',
    mileage: '',
    cost: '',
    provider: '',
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
        
        // Fetch vehicles
        const vehiclesResult = await fetchUserData<Vehicle>('vehicles', user.id);
        
        if (vehiclesResult.error) {
          throw new Error(vehiclesResult.error);
        }
        
        if (vehiclesResult.data && vehiclesResult.data.length > 0) {
          setVehicles(vehiclesResult.data);
          
          // Set the first vehicle as selected if none is selected
          if (!selectedVehicleId && vehiclesResult.data.length > 0) {
            setSelectedVehicleId(vehiclesResult.data[0].id);
          }
          
          // Fetch maintenance records
          const recordsResult = await fetchUserData<MaintenanceRecord>('maintenance_records', user.id);
          
          if (recordsResult.error) {
            throw new Error(recordsResult.error);
          }
          
          if (recordsResult.data) {
            setMaintenanceRecords(recordsResult.data);
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
        toast({
          title: "Error Loading Data",
          description: error instanceof Error ? error.message : "Failed to load your vehicle data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);

  // Handler for input changes when adding a new vehicle
  const handleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewVehicle(prev => ({ ...prev, [name]: value }));
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

    setIsLoading(true);
    
    try {
      const vehicleId = uuidv4();
      const vehicleWithId = { ...newVehicle, id: vehicleId, user_id: userId };
      
      // Add to local state first for immediate UI update
      setVehicles(prev => [...prev, vehicleWithId]);
      
      // Then sync with Supabase
      const result = await syncDataWithSupabase('vehicles', [vehicleWithId], userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Clear the form
      setNewVehicle({
        make: '',
        model: '',
        year: '',
        licensePlate: '',
        vin: '',
        insuranceProvider: '',
        insurancePolicy: '',
      });
      
      toast({
        title: "Vehicle Added",
        description: "Your vehicle has been added successfully",
      });
      
      // Set this as the selected vehicle if none is selected
      if (!selectedVehicleId) {
        setSelectedVehicleId(vehicleId);
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
        provider: '',
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
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-screen-xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Vehicle Information</h1>
          
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
                              {vehicle.licensePlate && (
                                <Badge className="mr-2">
                                  License: {vehicle.licensePlate}
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
                                <p>{vehicle.insuranceProvider || 'Not provided'}</p>
                              </div>
                              {vehicle.insurancePolicy && (
                                <div className="col-span-2">
                                  <p className="font-medium">Policy #:</p>
                                  <p>{vehicle.insurancePolicy}</p>
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
                          <Label htmlFor="licensePlate">License Plate</Label>
                          <Input 
                            id="licensePlate" 
                            name="licensePlate"
                            placeholder="e.g. ABC123" 
                            value={newVehicle.licensePlate}
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
                          <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                          <Input 
                            id="insuranceProvider" 
                            name="insuranceProvider"
                            placeholder="e.g. State Farm" 
                            value={newVehicle.insuranceProvider}
                            onChange={handleVehicleInputChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="insurancePolicy">Policy Number</Label>
                          <Input 
                            id="insurancePolicy" 
                            name="insurancePolicy"
                            placeholder="e.g. POL123456" 
                            value={newVehicle.insurancePolicy}
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
                                        <p>{record.provider || 'Not provided'}</p>
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
                          <Label htmlFor="provider">Service Provider</Label>
                          <Input 
                            id="provider" 
                            name="provider"
                            placeholder="e.g. Jiffy Lube" 
                            value={newMaintenanceRecord.provider}
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