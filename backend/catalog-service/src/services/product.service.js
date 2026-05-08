const productRepository = require('../repositories/product.repository');

const sampleProducts = [
  {
    name: 'Biblioteca Nogal Modular',
    category: 'Almacenamiento',
    woodType: 'Nogal',
    finish: 'Mate natural',
    price: 1850000,
    stock: 4,
    description: 'Biblioteca de seis modulos para estudio y sala con repisas reforzadas.',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Mesa de Comedor Roble 6 Puestos',
    category: 'Comedor',
    woodType: 'Roble',
    finish: 'Sellador satinado',
    price: 2490000,
    stock: 2,
    description: 'Mesa rectangular fabricada en roble macizo con estructura de alta resistencia.',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Puerta Interior Cedro Premium',
    category: 'Puertas',
    woodType: 'Cedro',
    finish: 'Laca semibrillo',
    price: 1320000,
    stock: 7,
    description: 'Puerta de cedro con refuerzo interior, ideal para proyectos residenciales.',
    imageUrl: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80'
  }
];

class ProductService {
  listProducts() {
    return productRepository.listAll();
  }

  async getProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Producto no encontrado.');
    }

    return product;
  }

  createProduct(payload) {
    return productRepository.create(payload);
  }

  async updateProduct(id, payload) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error('Producto no encontrado.');
    }

    await productRepository.update(id, payload);
    return productRepository.findById(id);
  }

  async deleteProduct(id) {
    const deletedRows = await productRepository.delete(id);
    if (!deletedRows) {
      throw new Error('Producto no encontrado.');
    }
  }

  async seedProducts() {
    const total = await productRepository.count();
    if (total === 0) {
      await productRepository.bulkCreate(sampleProducts);
    }
  }
}

module.exports = new ProductService();

