const productService = require('../services/product.service');
const { validateProduct } = require('../dtos/product.dto');

class ProductController {
  async list(req, res) {
    const products = await productService.listProducts();
    return res.json(products);
  }

  async getOne(req, res) {
    try {
      const product = await productService.getProduct(Number(req.params.id));
      return res.json(product);
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }

  async create(req, res) {
    try {
      const payload = validateProduct(req.body);
      const product = await productService.createProduct(payload);
      return res.status(201).json(product);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const payload = validateProduct(req.body);
      const product = await productService.updateProduct(Number(req.params.id), payload);
      return res.json(product);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      await productService.deleteProduct(Number(req.params.id));
      return res.status(204).send();
    } catch (error) {
      return res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new ProductController();

