import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { vendorApi } from '../api/endpoints';
import { apiError } from '../api/client';
import { Message, Skeleton, formatMoney } from '../components/UI';
import { MainStackParams } from '../navigation/RootNavigator';
import { useAuth } from '../state/AuthContext';
import { useSavedVendors } from '../hooks/useSavedVendors';
import { colors } from '../theme';
import type { Vendor } from '../types';

const categories: { title: string; value: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { title:'Venue', value:'Venue', icon:'business-outline' },
  { title:'Catering', value:'Catering', icon:'restaurant-outline' },
  { title:'Photography', value:'Photography', icon:'camera-outline' },
  { title:'Live music', value:'Orchestra & Melody', icon:'musical-notes-outline' },
];

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>();
  const { user } = useAuth();
  const focused = useIsFocused();
  const [search, setSearch] = useState('');
  const [city, setCity] = useState(user?.city || '');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [matchedOccasion, setMatchedOccasion] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const { savedIds, toggle, savedError } = useSavedVendors();
  useEffect(() => {
    if (!focused) return;
    let active = true;
    const timer = setTimeout(() => vendorApi.list({ search:search.trim() || undefined, city:city.trim() || undefined })
      .then(({ data }) => { if (active) { setVendors(data.data.vendors); setMatchedOccasion(data.data.matchedOccasion); setError(''); } })
      .catch(cause => { if (active) setError(apiError(cause)); })
      .finally(() => { if (active) setLoading(false); }),280);
    return () => { active=false; clearTimeout(timer); };
  },[search,city,focused,refresh]);
  function browse() { navigation.navigate('VendorListing',{city:city.trim() || undefined, search:search.trim() || undefined}); }
  return <SafeAreaView style={styles.page} edges={['top']}>
    <View style={styles.header}><Text style={styles.brand}>✳ evently</Text><Ionicons name="location-outline" color={colors.slate} size={16} /><TextInput accessibilityLabel="City" value={city} onChangeText={value=>{setCity(value);setLoading(true);}} placeholder="Choose city" placeholderTextColor={colors.muted} style={styles.city} /></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Text style={styles.title}>What are you planning?</Text><Text style={styles.subtitle}>One service or your entire event.</Text>
      <View style={styles.search}><Ionicons name="search-outline" size={18} color={colors.muted} /><TextInput accessibilityLabel="Search occasions, services or vendors" value={search} onChangeText={value=>{setSearch(value);setLoading(true);}} onSubmitEditing={browse} returnKeyType="search" placeholder="Occasion, service or vendor" placeholderTextColor={colors.muted} style={styles.searchInput} /><Pressable accessibilityRole="button" accessibilityLabel="Search vendors" onPress={browse} style={styles.searchButton}><Ionicons name="arrow-forward" color="white" size={18} /></Pressable></View>
      {!search.trim() ? <>
        <View style={styles.hero}><Image source={require('../../assets/onboarding/floral-table.png')} style={StyleSheet.absoluteFill} resizeMode="cover" /><LinearGradient colors={['rgba(70,9,28,.9)','rgba(70,9,28,.12)']} start={{x:0,y:0}} end={{x:1,y:0}} style={StyleSheet.absoluteFill} /><View style={styles.heroCopy}><Text style={styles.heroTitle}>Your event, made easy.</Text><Text style={styles.heroHint}>Choose a planner. Pick your services.</Text><Pressable accessibilityRole="button" onPress={()=>navigation.navigate('PlanEvent')} style={styles.planButton}><Text style={styles.planText}>Start planning  ↗</Text></Pressable></View></View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Find a service</Text><Pressable onPress={()=>navigation.navigate('VendorListing',{city:city.trim() || undefined,intent:'single_service'})} style={styles.link}><Text style={styles.linkText}>View all →</Text></Pressable></View>
        <View style={styles.categories}>{categories.map(item=><Pressable accessibilityRole="button" accessibilityLabel={item.title} key={item.value} onPress={()=>navigation.navigate('VendorListing',{category:item.value,city:city.trim() || undefined,intent:'single_service'})} style={styles.category}><View style={styles.categoryIcon}><Ionicons name={item.icon} size={22} color={colors.indigo} /></View><Text style={styles.categoryText}>{item.title}</Text></Pressable>)}</View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Plan an occasion</Text></View><View style={styles.occasions}>{['Wedding','Birthday','Ring Ceremony','Corporate','Your occasion'].map(occasion=><Pressable accessibilityRole="button" key={occasion} onPress={()=>navigation.navigate('PlanEvent',{occasion:occasion==='Your occasion'?'':occasion})} style={styles.occasion}><Text style={styles.occasionText}>{occasion==='Your occasion'?'+ ':''}{occasion}</Text></Pressable>)}</View>
      </> : null}
      <View style={styles.section}><Text style={styles.sectionTitle}>{matchedOccasion && !loading ? `Vendors for ${matchedOccasion}` : search.trim()?'Search results':'Vendors near you'}</Text><Pressable onPress={browse} style={styles.link}><Text style={styles.linkText}>Explore →</Text></Pressable></View>
      {savedError ? <Text style={styles.error}>{savedError}</Text> : null}
      {loading ? <><Skeleton height={108} /><Skeleton height={108} /></> : error ? <Message text={error} retry={()=>{setLoading(true);setRefresh(n=>n+1);}} /> : !vendors.length ? <Message text="No vendors found. Try another service or city." /> : vendors.slice(0,5).map(vendor=><View key={vendor._id} style={styles.vendor}><Pressable accessibilityRole="button" accessibilityLabel={`View ${vendor.businessName}`} style={styles.vendorMain} onPress={()=>navigation.navigate('VendorDetail',{vendorId:vendor._id,occasion:matchedOccasion || undefined,intent:matchedOccasion?'full_event_package':'single_service'})}>
        {vendor.portfolioImages[0]?<Image source={{uri:vendor.portfolioImages[0]}} style={styles.photo}/>:<View style={[styles.photo,styles.photoFallback]}><Ionicons name="sparkles-outline" size={24} color={colors.indigo}/></View>}
        <View style={styles.vendorInfo}><Text numberOfLines={2} style={styles.vendorName}>{vendor.businessName}</Text><Text style={styles.vendorType}>{vendor.vendorType}</Text><Text style={styles.vendorMeta}>{vendor.address.city} · {vendor.reviewCount?`★ ${vendor.rating.toFixed(1)} (${vendor.reviewCount})`:'New'}</Text><Text style={styles.price}>From {formatMoney(vendor.startingPrice)}</Text></View>
      </Pressable><Pressable accessibilityRole="button" accessibilityLabel={`${savedIds.has(vendor._id)?'Unsave':'Save'} ${vendor.businessName}`} accessibilityState={{selected:savedIds.has(vendor._id)}} onPress={()=>toggle(vendor._id)} style={styles.save}><Ionicons name={savedIds.has(vendor._id)?'heart':'heart-outline'} size={20} color={colors.indigo}/></Pressable></View>)}
    </ScrollView>
  </SafeAreaView>;
}

const styles=StyleSheet.create({
  page:{flex:1,backgroundColor:colors.soft},header:{flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:10,borderBottomWidth:1,borderColor:colors.border,backgroundColor:colors.white,gap:5},brand:{flex:1,color:colors.indigo,fontSize:23,fontWeight:'700',letterSpacing:-.8},city:{maxWidth:130,minWidth:75,minHeight:44,fontSize:12,color:colors.slate,paddingVertical:0},content:{padding:16,paddingBottom:28},title:{fontSize:22,fontWeight:'700',color:colors.slate},subtitle:{fontSize:12,color:colors.muted,marginTop:6},
  search:{flexDirection:'row',alignItems:'center',gap:8,borderWidth:1,borderColor:colors.border,backgroundColor:colors.white,borderRadius:12,paddingLeft:12,paddingRight:4,minHeight:48,marginVertical:16},searchInput:{flex:1,minWidth:0,color:colors.slate,fontSize:12},searchButton:{width:40,height:40,borderRadius:9,backgroundColor:colors.indigo,justifyContent:'center',alignItems:'center'},hero:{height:138,borderRadius:14,overflow:'hidden',justifyContent:'center',marginBottom:6},heroCopy:{padding:16},heroTitle:{fontSize:18,fontWeight:'700',color:'white'},heroHint:{fontSize:11,color:'#FFF0F1',marginTop:5},planButton:{backgroundColor:'#FFF4F2',borderRadius:9,paddingHorizontal:13,minHeight:40,justifyContent:'center',alignSelf:'flex-start',marginTop:12},planText:{color:colors.indigoDark,fontSize:12,fontWeight:'600'},
  section:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8,marginTop:14,marginBottom:10,minHeight:28},sectionTitle:{fontSize:16,fontWeight:'700',color:colors.slate,flexShrink:1},link:{minHeight:40,justifyContent:'center',paddingHorizontal:3},linkText:{fontSize:12,color:colors.indigo,fontWeight:'600'},categories:{flexDirection:'row',gap:8},category:{flex:1,alignItems:'stretch'},categoryIcon:{height:48,borderRadius:13,backgroundColor:colors.paleIndigo,justifyContent:'center',alignItems:'center'},categoryText:{fontSize:11,color:colors.slate,textAlign:'center',marginTop:7},occasions:{flexDirection:'row',flexWrap:'wrap',gap:8},occasion:{minHeight:40,paddingHorizontal:11,paddingVertical:10,borderWidth:1,borderColor:colors.border,borderRadius:10,backgroundColor:colors.white,justifyContent:'center'},occasionText:{fontSize:12,color:colors.slate},
  vendor:{flexDirection:'row',borderWidth:1,borderColor:colors.border,borderRadius:14,backgroundColor:colors.white,padding:10,marginBottom:10},vendorMain:{flex:1,flexDirection:'row',gap:11,minWidth:0},photo:{width:78,height:92,borderRadius:9},photoFallback:{justifyContent:'center',alignItems:'center',backgroundColor:colors.paleIndigo},vendorInfo:{flex:1,minWidth:0,justifyContent:'center'},vendorName:{fontSize:13,fontWeight:'700',color:colors.slate},vendorType:{fontSize:11,color:colors.muted,marginTop:4},vendorMeta:{fontSize:11,color:colors.muted,marginTop:4},price:{fontSize:12,fontWeight:'700',color:colors.slate,marginTop:7},save:{width:34,minHeight:44,alignItems:'center',paddingTop:2},error:{fontSize:12,color:colors.danger,marginBottom:10},
});
