function modifier(name) {
	name =
		name.charAt(0).toUpperCase() +
		name.trim().toLowerCase().slice(1);

	return name;
}


export {modifier}