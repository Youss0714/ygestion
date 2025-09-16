import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { type Client } from "@shared/schema";

interface SimpleClientSelectProps {
  value?: number;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function SimpleClientSelect({ 
  value, 
  onChange, 
  placeholder = "Rechercher ou créer un client...",
  disabled = false,
}: SimpleClientSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch all clients
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
    retry: false,
  });

  // Get selected client
  const selectedClient = clients.find(c => c.id === value);

  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelect = (clientId: number) => {
    onChange(clientId);
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
          {selectedClient ? (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{selectedClient.name}</span>
              {selectedClient.company && (
                <span className="text-sm text-muted-foreground">- {selectedClient.company}</span>
              )}
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
          {filteredClients.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? `Aucun client trouvé pour "${searchQuery}"` : "Aucun client trouvé"}
            </div>
          ) : (
            <div className="p-1">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => handleSelect(client.id)}
                  className={cn(
                    "flex items-center space-x-2 rounded-sm px-2 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    value === client.id && "bg-accent text-accent-foreground"
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{client.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {client.company && `${client.company} • `}
                      {client.email}
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