import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FaSearch, FaTimes } from 'react-icons/fa';

const App = () => {
    const [pokemonList, setPokemonList] = useState([]);
    const [filteredPokemon, setFilteredPokemon] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [types, setTypes] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState(null);

    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=150');
                const pokemonDetails = await Promise.all(
                    response.data.results.map(async (pokemon) => {
                        const details = await axios.get(pokemon.url);
                        return {
                            id: details.data.id,
                            name: details.data.name,
                            image: details.data.sprites.front_default,
                            types: details.data.types.map(type => type.type.name),
                            height: details.data.height,
                            weight: details.data.weight,
                            abilities: details.data.abilities.map(ability => ability.ability.name)
                        };
                    })
                );
                
                setPokemonList(pokemonDetails);
                setFilteredPokemon(pokemonDetails);
                
                const allTypes = [...new Set(pokemonDetails.flatMap(p => p.types))];
                setTypes(allTypes);
                
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch Pokémon data');
                setLoading(false);
            }
        };

        fetchPokemon();
    }, []);

    useEffect(() => {
        let filtered = pokemonList;
        
        if (searchTerm) {
            filtered = filtered.filter(pokemon => 
                pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (selectedType !== 'all') {
            filtered = filtered.filter(pokemon => 
                pokemon.types.includes(selectedType)
            );
        }
        
        setFilteredPokemon(filtered);
    }, [searchTerm, selectedType, pokemonList]);

    const handlePokemonClick = (pokemon) => {
        setSelectedPokemon(pokemon);
    };

    const closeModal = () => {
        setSelectedPokemon(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-700 animate-pulse">Loading Pokémon...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600 animate-bounce">{error}</div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
                <h1 className="text-4xl font-bold text-center animate__animated animate__fadeIn">Pokémon Explorer</h1>
            </header>

            <main className="container mx-auto p-4">
                <div className="flex flex-col md:flex-row gap-4 mb-6 animate__animated animate__fadeInUp">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search Pokémon..."
                            className="w-full p-3 pl-10 border rounded-lg shadow-sm search-input focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                    <select
                        className="p-3 border rounded-lg shadow-sm focus:outline-none"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="all">All Types</option>
                        {types.map(type => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {filteredPokemon.length === 0 ? (
                    <div className="text-center text-xl text-gray-600 animate__animated animate__fadeIn">
                        <div className="text-6xl mb-4">🔍</div>
                        No Pokémon found matching your criteria
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredPokemon.map(pokemon => (
                            <motion.div 
                                key={pokemon.id} 
                                className="pokemon-card bg-white rounded-xl shadow-md p-6 cursor-pointer"
                                onClick={() => handlePokemonClick(pokemon)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="text-center">
                                    <img 
                                        src={pokemon.image} 
                                        alt={pokemon.name}
                                        className="mx-auto h-32 w-32 object-contain hover:scale-110 transition-transform duration-300"
                                    />
                                    <h2 className="text-2xl font-bold mt-4 text-gray-800">
                                        {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                                    </h2>
                                    <p className="text-gray-500">#{pokemon.id.toString().padStart(3, '0')}</p>
                                    <div className="flex justify-center gap-2 mt-4">
                                        {pokemon.types.map(type => (
                                            <span 
                                                key={type}
                                                className={`type-badge px-3 py-1 rounded-full text-sm text-white ${
                                                    type === 'fire' ? 'bg-red-500' :
                                                    type === 'water' ? 'bg-blue-500' :
                                                    type === 'grass' ? 'bg-green-500' :
                                                    type === 'electric' ? 'bg-yellow-500' :
                                                    type === 'psychic' ? 'bg-purple-500' :
                                                    type === 'ice' ? 'bg-cyan-500' :
                                                    type === 'dragon' ? 'bg-indigo-500' :
                                                    type === 'dark' ? 'bg-gray-800' :
                                                    type === 'fairy' ? 'bg-pink-500' :
                                                    type === 'normal' ? 'bg-gray-500' :
                                                    type === 'fighting' ? 'bg-red-700' :
                                                    type === 'flying' ? 'bg-blue-300' :
                                                    type === 'poison' ? 'bg-purple-700' :
                                                    type === 'ground' ? 'bg-yellow-700' :
                                                    type === 'rock' ? 'bg-yellow-800' :
                                                    type === 'bug' ? 'bg-green-700' :
                                                    type === 'ghost' ? 'bg-purple-800' :
                                                    type === 'steel' ? 'bg-gray-400' :
                                                    'bg-gray-600'
                                                }`}
                                            >
                                                {type.charAt(0).toUpperCase() + type.slice(1)}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {selectedPokemon && (
                    <motion.div 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div 
                            className="bg-white rounded-xl p-6 max-w-md w-full"
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.5 }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-3xl font-bold text-gray-800">
                                    {selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}
                                </h2>
                                <button 
                                    onClick={closeModal}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            <div className="text-center">
                                <img 
                                    src={selectedPokemon.image} 
                                    alt={selectedPokemon.name}
                                    className="mx-auto h-40 w-40 object-contain"
                                />
                            </div>
                            <div className="mt-4 space-y-2">
                                <p className="text-gray-600">
                                    <span className="font-bold">Height:</span> {selectedPokemon.height / 10}m
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-bold">Weight:</span> {selectedPokemon.weight / 10}kg
                                </p>
                                <div>
                                    <span className="font-bold">Abilities:</span>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {selectedPokemon.abilities.map(ability => (
                                            <span 
                                                key={ability}
                                                className="px-2 py-1 bg-gray-200 rounded-full text-sm"
                                            >
                                                {ability}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default App; 