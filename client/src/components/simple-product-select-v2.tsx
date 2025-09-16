import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { type Product } from "@shared/schema";

interface SimpleProductSelectProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  onProductSelect?: (product: Product) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SimpleProductSelectV2({ 
  value, 
  onChange, 
  onProductSelect,
  placeholder = "Rechercher un produit...",
  disabled = false,
}: SimpleProductSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    retry: false,
  });

  // Get selected product
  const selectedProduct = products.find(p => p.id === value);

  // Filter products based on search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `${numAmount.toLocaleString('fr-FR')} F CFA`;
  };

  const handleSelect = (productId: number) => {
    const product = products.find(p => p.id === productId);
    
    onChange(productId);
    if (product && onProductSelect) {
      onProductSelect(product);
    }
    
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedProduct ? (
            <div className="flex items-center space-x-2">
              <Package className="w-4 h-4" />
              <span>{selectedProduct.name}</span>
              <span className="text-sm text-muted-foreground">
                • {formatCurrency(selectedProduct.priceHT)} HT
                {selectedProduct.stock !== undefined && ` • Stock: ${selectedProduct.stock}`}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-3 border-b">
          <Input
            placeholder="Tapez pour rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? `Aucun produit trouvé pour "${searchQuery}"` : "Aucun produit trouvé"}
            </div>
          ) : (
            <div className="p-1">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product.id)}
                  className={cn(
                    "flex items-center space-x-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    value === product.id && "bg-accent text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === product.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCurrency(product.priceHT)} HT
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {product.description && `${product.description} • `}
                      {product.stock !== undefined && `Stock: ${product.stock}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}