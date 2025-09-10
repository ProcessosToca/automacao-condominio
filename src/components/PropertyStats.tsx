import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, MapPin, User, Phone, Calendar, Mail } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyStatsProps {
  properties: Property[];
}

const PropertyStats = ({ properties }: PropertyStatsProps) => {
  const totalProperties = properties.length;
  const propertiesWithAddress = properties.filter(p => p.address && p.address.trim() !== '').length;
  const propertiesWithAdmin = properties.filter(p => p.admin_name && p.admin_name.trim() !== '').length;
  const propertiesWithEmail = properties.filter(p => p.admin_email && p.admin_email.trim() !== '').length;
  const propertiesWithPhone = properties.filter(p => p.admin_phone && p.admin_phone.trim() !== '').length;
  
  // Calcular propriedades criadas nos últimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentProperties = properties.filter(p => new Date(p.created_at) > thirtyDaysAgo).length;

  const stats = [
    {
      title: 'Total de Condomínios',
      value: totalProperties,
      icon: Building,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Com Endereço',
      value: propertiesWithAddress,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Com Administrador',
      value: propertiesWithAdmin,
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Com Email',
      value: propertiesWithEmail,
      icon: Mail,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    {
      title: 'Com Telefone',
      value: propertiesWithPhone,
      icon: Phone,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Criados (30 dias)',
      value: recentProperties,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    }
  ];

  if (totalProperties === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <IconComponent className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PropertyStats;
