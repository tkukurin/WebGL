
class DeCasteljauSelection {
    constructor(container, scene, intersectionFinder) {
        this.selectedLine = undefined;
        this.selectedPoint = undefined;
        this.composites = scene.children;
        this.intersectionFinder = intersectionFinder;
        this.scene = scene;

        this.onMousemove = this.onMousemove.bind(this);
        this.onMousedown = this.onMousedown.bind(this);
        this.onKeyup = this.onKeyup.bind(this);
        this.trySelectFirstPoint = this.trySelectFirstPoint.bind(this);
    }

    collectData() {
        const lines = this.composites
            .filter(obj => obj.userData.isUserCreated)
            .map(obj => obj.userData.endpoints);    
        const selectedFinalPoint = pointLocation(this.selectedPoint);

        return { lines, selectedFinalPoint };
    }

    onMousemove(e) {
        this.selectedLine = makeUnselected(this.selectedLine);

        const intersect = this.intersectionFinder.getIntersections(e.clientX, e.clientY, this.composites)
                .map(o => o.object)
                .filter(o => o.userData.isSplittable)
                .map(o => o.parent)
                .find(parent => parent);
                
        this.selectedLine = makeSelected(intersect);
    }

    trySelectFirstPoint(e) {
        if (e.which != LEFT_MOUSE_BUTTON) return;

        const found = this.intersectionFinder.getIntersections(e.clientX, e.clientY, this.composites)
                .map(o => o.object)
                .filter(obj => isIntersectPoint(obj))
                .find(o => o);

        if (!found) {
            this.selectedPoint = makeUnselectedPoint(this.selectedPoint);
            return;
        }

        this.selectedPoint = makeSelectedPoint(found);
    }

    onMousedown(e) {
        if (!this.selectedPoint) return this.trySelectFirstPoint(e);
        if (e.which != LEFT_MOUSE_BUTTON) return;

        const selectedPoint2 = this.intersectionFinder.getIntersections(e.clientX, e.clientY, this.composites)
                .map(o => o.object)
                .filter(obj => isIntersectPoint(obj))
                .find(o => o);

        const oldSelectedPoint = this.selectedPoint;
        this.selectedPoint = makeUnselectedPoint(this.selectedPoint);
        
        if (selectedPoint2) {
            const lineComposite = createNewLine(oldSelectedPoint, selectedPoint2);
            lineComposite.userData.isUserCreated = true;

            this.scene.add(lineComposite);
        }
    }

    onKeyup(keyEvent) {
        const key = keyEvent.key;
        const keyAsInteger = parseInt(key);

        if (!keyAsInteger || !this.selectedLine) return;

        this.selectedPoint = makeUnselectedPoint(this.selectedPoint);
        
        const newPointsComposite = createDivisions(this.selectedLine, keyAsInteger);
        const existingIntersectPointsComposite = findExistingIntersectPoints(this.selectedLine.children);

        if (existingIntersectPointsComposite) {        
            if (existingIntersectPointsComposite.userData.connectedLine) {
                existingIntersectPointsComposite.userData.connectedLine.forEach(line => this.scene.remove(line));
            }

            this.selectedLine.remove(existingIntersectPointsComposite);
            this.scene.remove(existingIntersectPointsComposite);
        }

        this.selectedLine.add(newPointsComposite);
    }

}