import CrudResourcePage from './CrudResourcePage';
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../services/adminService';

export default function BrandsPage() {
  return (
    <CrudResourcePage
      title="Brands"
      listFn={getBrands}
      createFn={createBrand}
      updateFn={updateBrand}
      deleteFn={deleteBrand}
    />
  );
}
