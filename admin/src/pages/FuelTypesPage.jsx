import CrudResourcePage from './CrudResourcePage';
import {
  getFuelTypes,
  createFuelType,
  updateFuelType,
  deleteFuelType,
} from '../services/adminService';

export default function FuelTypesPage() {
  return (
    <CrudResourcePage
      title="Fuel Types"
      listFn={getFuelTypes}
      createFn={createFuelType}
      updateFn={updateFuelType}
      deleteFn={deleteFuelType}
    />
  );
}
