import CrudResourcePage from './CrudResourcePage';
import {
  getCities,
  createCity,
  updateCity,
  deleteCity,
} from '../services/adminService';

export default function CitiesPage() {
  return (
    <CrudResourcePage
      title="Cities"
      listFn={getCities}
      createFn={createCity}
      updateFn={updateCity}
      deleteFn={deleteCity}
    />
  );
}
